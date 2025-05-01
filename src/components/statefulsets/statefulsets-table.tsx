import { Link } from 'react-router';
import { V1StatefulSet } from '@kubernetes/client-node';
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
  PaginationState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/table/sortable-header';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { arrayToLabelSelector, labelSelectorToArray } from '@/lib/labels';
import { getAge } from '@/lib/time';

interface StatefulSetsTableProps {
  statefulsets: Array<V1StatefulSet>;
  initialFilters?: {
    name: string;
    labelSelector: string;
  };
  columnVisibility?: {
    namespace?: boolean;
    labels?: boolean;
  };
  navigateToStatefulSet?: (namespace: string, name: string) => void;
}

export const StatefulSetsTable = ({
  statefulsets,
  initialFilters = { name: '', labelSelector: '' },
  columnVisibility,
  navigateToStatefulSet,
}: StatefulSetsTableProps) => {
  // Create initial filters array
  const initialColumnFilters: ColumnFiltersState = [
    ...(initialFilters.name
      ? [{ id: 'name', value: initialFilters.name }]
      : []),
    ...(initialFilters.labelSelector
      ? [{ id: 'labels', value: initialFilters.labelSelector }]
      : []),
  ];

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // Initialize column visibility state based on props
  const [columnVisibilityState, setColumnVisibilityState] = useState({
    namespace: columnVisibility?.namespace ?? true,
    labels: columnVisibility?.labels ?? false,
  });

  // Update column visibility when props change
  useEffect(() => {
    setColumnVisibilityState(prev => ({
      ...prev,
      namespace: columnVisibility?.namespace ?? true,
      labels: columnVisibility?.labels ?? false,
    }));
  }, [columnVisibility]);

  // Create unique label options from all statefulsets
  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    statefulsets.forEach((statefulset) => {
      const labels = statefulset.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [statefulsets]);

  const columns: ColumnDef<V1StatefulSet>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => (
        <div>
          <SortableHeader column={column} title="Name" />
        </div>
      ),
      cell: ({ row }) => {
        const name = row.original.metadata?.name;
        const namespace = row.original.metadata?.namespace;
        return (
          <Button 
            variant="link" 
            className="underline"
            onClick={() => {
              if (navigateToStatefulSet && name && namespace) {
                navigateToStatefulSet(namespace, name);
              }
            }}
          >
            {name}
          </Button>
        );
      },
    },
    {
      id: 'namespace',
      accessorKey: 'metadata.namespace',
      header: ({ column }) => (
        <SortableHeader column={column} title="Namespace" />
      ),
      cell: ({ row }) => row.original.metadata?.namespace,
    },
    {
      id: 'replicas',
      accessorKey: 'spec.replicas',
      header: ({ column }) => (
        <SortableHeader column={column} title="Replicas" />
      ),
      cell: ({ row }) =>
        `${row.original.status?.readyReplicas ?? 0}/${row.original.spec?.replicas ?? 0}`,
    },
    {
      id: 'currentReplicas',
      accessorKey: 'status.currentReplicas',
      header: ({ column }) => (
        <SortableHeader column={column} title="Current" />
      ),
      cell: ({ row }) => row.original.status?.currentReplicas ?? 0,
    },
    {
      id: 'updatedReplicas',
      accessorKey: 'status.updatedReplicas',
      header: ({ column }) => (
        <SortableHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => row.original.status?.updatedReplicas ?? 0,
    },
    {
      id: 'age',
      accessorKey: 'metadata.creationTimestamp',
      header: ({ column }) => <SortableHeader column={column} title="Age" />,
      cell: ({ row }) =>
        getAge(String(row.original.metadata?.creationTimestamp)),
      sortingFn: (rowA, rowB) => {
        const dateA = String(rowA.original.metadata?.creationTimestamp || '');
        const dateB = String(rowB.original.metadata?.creationTimestamp || '');
        return dateA.localeCompare(dateB);
      },
    },
    {
      id: 'labels',
      accessorKey: 'metadata.labels',
      header: ({ column }) => <SortableHeader column={column} title="Labels" />,
      enableHiding: true,
      cell: ({ row }) => {
        const labels = row.original.metadata?.labels || {};
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(labels).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
              >
                {key}={value}
              </span>
            ))}
          </div>
        );
      },
      filterFn: (row, _, filterValue) => {
        const labels = row.original.metadata?.labels || {};
        if (!filterValue) return true;

        const labelSelectors = (filterValue as string)
          .split(',')
          .filter(Boolean);

        if (labelSelectors.length === 0) return true;

        return labelSelectors.every((selector) => {
          if (!selector.includes('=')) return true;

          const [key, value] = selector.split('=').map((s) => s.trim());
          if (!key || !value) return true;

          return labels[key] === value;
        });
      },
    },
  ];

  const table = useReactTable({
    data: statefulsets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      sorting,
      pagination,
      columnVisibility: columnVisibilityState,
    },
  });

  return (
    <Card>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Filters</AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="grid grid-cols-4 gap-4 mt-4">
                {table
                  .getAllColumns()
                  .filter((column) => ['name'].includes(column.id))
                  .map((column) => (
                    <div key={column.id}>
                      <Input
                        placeholder={`Filter ${column.id}...`}
                        value={(column.getFilterValue() as string) ?? ''}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        className="max-w-xs"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                    </div>
                  ))}
                <div>
                  <MultiSelect
                    options={labelOptions}
                    placeholder="Filter by labels..."
                    defaultValue={labelSelectorToArray(
                      initialFilters.labelSelector
                    )}
                    onValueChange={(values) => {
                      const labelColumn = table.getColumn('labels');
                      if (labelColumn) {
                        labelColumn.setFilterValue(
                          arrayToLabelSelector(values)
                        );
                      }
                    }}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                    No statefulsets found.
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
