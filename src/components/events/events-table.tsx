import { CoreV1Event } from '@kubernetes/client-node';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
  PaginationState,
  VisibilityState,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useEffect } from 'react';
import { SortableHeader } from '@/components/table/sortable-header';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { getAge } from '@/lib/time';

interface EventsTableProps {
  events: Array<CoreV1Event>;
  initialFilters?: {
    name: string;
    type: string;
    reason: string;
    message: string;
  };
  columnVisibility?: VisibilityState;
}

export const EventsTable = ({
  events,
  initialFilters = { name: '', type: '', reason: '', message: '' },
  columnVisibility = {},
}: EventsTableProps) => {
  const initialColumnFilters: ColumnFiltersState = [
    ...(initialFilters.name
      ? [{ id: 'name', value: initialFilters.name }]
      : []),
    ...(initialFilters.type
      ? [{ id: 'type', value: initialFilters.type }]
      : []),
    ...(initialFilters.reason
      ? [{ id: 'reason', value: initialFilters.reason }]
      : []),
    ...(initialFilters.message
      ? [{ id: 'message', value: initialFilters.message }]
      : []),
  ];

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Collect filter options
  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.type) set.add(e.type);
    });
    return Array.from(set).map((t) => ({ label: t, value: t }));
  }, [events]);

  const reasonOptions = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.reason) set.add(e.reason);
    });
    return Array.from(set).map((r) => ({ label: r, value: r }));
  }, [events]);

  const columns: ColumnDef<CoreV1Event>[] = [
    {
      id: 'lastSeen',
      accessorFn: (row) =>
        row.eventTime?.toString() ||
        row.lastTimestamp?.toString() ||
        row.firstTimestamp?.toString() ||
        '',
      header: ({ column }) => (
        <SortableHeader column={column} title="Last Seen" />
      ),
      cell: ({ row }) => {
        const ts = row.getValue<string>('lastSeen');
        return getAge(ts);
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.getValue<string>('lastSeen');
        const b = rowB.getValue<string>('lastSeen');
        return a.localeCompare(b);
      },
    },
    {
      id: 'namespace',
      accessorKey: 'metadata.namespace',
      header: ({ column }) => (
        <SortableHeader column={column} title="Namespace" />
      ),
      cell: ({ row }) => row.original.metadata?.namespace,
      filterFn: (row, _, filterValue) => {
        const namespace = row.original.metadata?.namespace || '';
        if (!filterValue) return true;

        const namespaceFilters = (filterValue as string)
          .split(',')
          .filter(Boolean);
        if (namespaceFilters.length === 0) return true;

        return namespaceFilters.includes(namespace);
      },
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: ({ column }) => <SortableHeader column={column} title="Type" />,
      cell: ({ row }) => row.original.type,
      filterFn: (row, _, filterValue) => {
        const type = row.original.type || '';
        if (!filterValue) return true;

        const typeFilters = (filterValue as string).split(',').filter(Boolean);
        if (typeFilters.length === 0) return true;

        return typeFilters.includes(type);
      },
    },
    {
      id: 'reason',
      accessorKey: 'reason',
      header: ({ column }) => <SortableHeader column={column} title="Reason" />,
      cell: ({ row }) => row.original.reason,
      filterFn: (row, _, filterValue) => {
        const reason = row.original.reason || '';
        if (!filterValue) return true;

        const reasonFilters = (filterValue as string)
          .split(',')
          .filter(Boolean);
        if (reasonFilters.length === 0) return true;

        return reasonFilters.includes(reason);
      },
    },
    {
      id: 'name',
      accessorFn: (row) => {
        const name =
          (row as any).regarding?.name ||
          (row as any).involvedObject?.name ||
          '';
        const kind = (
          (row as any).regarding?.kind ||
          (row as any).involvedObject?.kind ||
          ''
        ).toLowerCase();
        return kind && name ? `${kind}/${name}` : name;
      },
      header: ({ column }) => <SortableHeader column={column} title="Object" />,
      cell: ({ row }) => {
        const objName = row.getValue<string>('name');
        return objName;
      },
    },
    {
      id: 'message',
      accessorKey: 'message',
      header: ({ column }) => (
        <SortableHeader column={column} title="Message" />
      ),
      cell: ({ row }) => row.original.message,
      enableHiding: true,
    },
  ];

  // manage visibility state
  const [visibility, setVisibility] = useState<VisibilityState>({
    ...columnVisibility,
  });

  useEffect(() => {
    setVisibility((prev) => ({ ...prev, ...columnVisibility }));
  }, [columnVisibility]);

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setVisibility,
    state: {
      columnFilters,
      sorting,
      pagination,
      columnVisibility: visibility,
    },
  });

  return (
    <Card>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible defaultValue="filters">
          <AccordionItem value="filters">
            <AccordionTrigger>Filters</AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <Input
                    placeholder="Filter object..."
                    value={
                      (table.getColumn('name')?.getFilterValue() as string) ??
                      ''
                    }
                    onChange={(e) =>
                      table.getColumn('name')?.setFilterValue(e.target.value)
                    }
                    className="max-w-xs"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
                <div>
                  <MultiSelect
                    placeholder="Filter by type..."
                    options={typeOptions}
                    defaultValue={[]}
                    onValueChange={(values) => {
                      table.getColumn('type')?.setFilterValue(values.join(','));
                    }}
                    className="max-w-xs"
                  />
                </div>
                <div>
                  <MultiSelect
                    placeholder="Filter by reason..."
                    options={reasonOptions}
                    defaultValue={[]}
                    onValueChange={(values) => {
                      table
                        .getColumn('reason')
                        ?.setFilterValue(values.join(','));
                    }}
                    className="max-w-xs"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Filter message content..."
                    value={
                      (table
                        .getColumn('message')
                        ?.getFilterValue() as string) ?? ''
                    }
                    onChange={(e) =>
                      table.getColumn('message')?.setFilterValue(e.target.value)
                    }
                    className="max-w-xs"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </CardContent>
    </Card>
  );
};
