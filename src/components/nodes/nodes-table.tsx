import { Link } from 'react-router';
import { V1Node } from '@kubernetes/client-node';
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
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/table/sortable-header';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { MultiSelect } from '@/components/ui/multi-select';

interface NodesTableProps {
  nodes: Array<V1Node>;
  initialFilters: {
    name: string;
    labelSelector: string;
  };
}

export const NodesTable = ({ nodes, initialFilters }: NodesTableProps) => {
  const initialColumnFilters: ColumnFiltersState = [
    ...(initialFilters.name ? [{ id: 'name', value: initialFilters.name }] : []),
    ...(initialFilters.labelSelector ? [{ id: 'labels', value: initialFilters.labelSelector }] : []),
  ];

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = useState<{
    [key: string]: boolean;
  }>({ labels: false });

  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    nodes.forEach(node => {
      const labels = node.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map(label => ({
      label,
      value: label,
    }));
  }, [nodes]);

  const labelSelectorToArray = (selector: string) =>
    selector.split(',').filter(Boolean);

  const arrayToLabelSelector = (array: string[]) =>
    array.join(',');

  const columns: ColumnDef<V1Node>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name;
        return (
          <Link to={`/nodes/${name}`}>
            <Button variant="link" className="underline">
              {name}
            </Button>
          </Link>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'status.conditions',
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const conditions = row.original.status?.conditions || [];
        const readyCondition = conditions.find(c => c.type === 'Ready');
        return readyCondition?.status === 'True' ? 'Ready' : 'Not Ready';
      },
    },
    {
      id: 'roles',
      accessorKey: 'metadata.labels',
      header: ({ column }) => <SortableHeader column={column} title="Roles" />,
      cell: ({ row }) => {
        const labels = row.original.metadata?.labels || {};
        const roles = [];
        if (labels['node-role.kubernetes.io/control-plane']) roles.push('Control Plane');
        if (labels['node-role.kubernetes.io/master']) roles.push('Master');
        if (labels['node-role.kubernetes.io/worker']) roles.push('Worker');
        return roles.join(', ') || 'Worker';
      },
    },
    {
      id: 'version',
      accessorKey: 'status.nodeInfo.kubeletVersion',
      header: ({ column }) => <SortableHeader column={column} title="Version" />,
      cell: ({ row }) => row.original.status?.nodeInfo?.kubeletVersion,
    },
    {
      id: 'age',
      accessorKey: 'metadata.creationTimestamp',
      header: ({ column }) => <SortableHeader column={column} title="Age" />,
      cell: ({ row }) => {
        const timestamp = row.original.metadata?.creationTimestamp;
        return timestamp ? new Date(timestamp).toLocaleString() : '';
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

        return labelSelectors.every(selector => {
          if (!selector.includes('=')) return true;
          const [key, value] = selector.split('=').map(s => s.trim());
          if (!key || !value) return true;
          return labels[key] === value;
        });
      },
    },
  ];

  const table = useReactTable({
    data: nodes,
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
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <Card>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Filters</AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Input
                    placeholder="Filter name..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(e) =>
                      table.getColumn('name')?.setFilterValue(e.target.value)
                    }
                    className="max-w-xs"
                  />
                </div>
                <div>
                  <MultiSelect
                    options={labelOptions}
                    placeholder="Filter by labels..."
                    defaultValue={labelSelectorToArray(initialFilters.labelSelector)}
                    onValueChange={(values) => {
                      const labelColumn = table.getColumn('labels');
                      if (labelColumn) {
                        labelColumn.setFilterValue(arrayToLabelSelector(values));
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
                    No nodes found.
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