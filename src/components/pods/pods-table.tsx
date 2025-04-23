import { Link } from 'react-router';
import { V1Pod } from '@kubernetes/client-node';
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
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/table/sortable-header';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { arrayToLabelSelector, labelSelectorToArray } from '@/lib/labels';
import { getAge } from '@/lib/time';

interface PodsTableProps {
  pods: Array<V1Pod>;
  initialFilters: {
    name: string;
    status: string;
    node: string;
    labelSelector: string;
  };
  columnVisibility?: {
    labels?: boolean;
    namespace?: boolean;
  };
  navigateToPod: (namespace: string, name: string) => void;
}

export const PodsTable = ({
  pods,
  initialFilters,
  columnVisibility,
  navigateToPod,
}: PodsTableProps) => {
  // Create initial filters array
  const initialColumnFilters: ColumnFiltersState = [
    ...(initialFilters.name
      ? [{ id: 'name', value: initialFilters.name }]
      : []),
    ...(initialFilters.status
      ? [{ id: 'phase', value: initialFilters.status }]
      : []),
    ...(initialFilters.node
      ? [{ id: 'nodeName', value: initialFilters.node }]
      : []),
    ...(initialFilters.labelSelector
      ? [{ id: 'labels', value: initialFilters.labelSelector }]
      : []),
  ];

  // Initialize state with the filters
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [colVisibility, setColVisibility] = useState<{
    [key: string]: boolean;
  }>(columnVisibility || {});

  // Create unique label options from all pods
  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    pods.forEach((pod) => {
      const labels = pod.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [pods]);

  // Get unique namespaces
  const namespaces = useMemo(() => {
    const namespaceSet = new Set<string>();
    pods.forEach((pod) => {
      if (pod.metadata?.namespace) {
        namespaceSet.add(pod.metadata.namespace);
      }
    });
    return Array.from(namespaceSet);
  }, [pods]);

  const columns: ColumnDef<V1Pod>[] = [
    {
      id: 'name', // Add explicit id
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name;
        return (
          <Button
            variant="link"
            className="underline"
            onClick={() =>
              navigateToPod(row.original.metadata?.namespace || '', name || '')
            }
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
      enableHiding: true,
    },
    {
      id: 'phase', // Add explicit id
      accessorKey: 'status.phase',
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => row.original.status?.phase,
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
      accessorKey: 'restarts',
      header: ({ column }) => (
        <SortableHeader column={column} title="Restarts" />
      ),
      cell: ({ row }) => {
        const containers = row.original.status?.containerStatuses || [];
        const totalRestarts = containers.reduce(
          (sum, container) => sum + (container.restartCount || 0),
          0
        );
        return totalRestarts;
      },
    },
    {
      id: 'nodeName', // Add explicit id
      accessorKey: 'spec.nodeName',
      header: ({ column }) => <SortableHeader column={column} title="Node" />,
      cell: ({ row }) => {
        const nodeName = row.original.spec?.nodeName;
        return nodeName ? (
          <Link to={`/nodes/${nodeName}`}>
            <Button variant="link" className="underline">
              {nodeName}
            </Button>
          </Link>
        ) : (
          ''
        );
      },
    },
    {
      accessorKey: 'ip',
      header: ({ column }) => (
        <SortableHeader column={column} title="IP Address" />
      ),
      cell: ({ row }) => row.original.status?.podIP,
    },
    {
      id: 'labels', // Add explicit id
      accessorKey: 'metadata.labels',
      header: ({ column }) => <SortableHeader column={column} title="Labels" />,
      enableHiding: true, // Enable column hiding
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

        // Handle empty or invalid filter value
        if (!filterValue) return true;

        const labelSelectors = (filterValue as string)
          .split(',')
          .filter(Boolean); // Remove empty strings

        // If no valid selectors, show all pods
        if (labelSelectors.length === 0) return true;

        return labelSelectors.every((selector) => {
          // Skip invalid selectors
          if (!selector.includes('=')) return true;

          const [key, value] = selector.split('=').map((s) => s.trim());
          // Skip if key or value is empty
          if (!key || !value) return true;

          return labels[key] === value;
        });
      },
    },
  ];

  const table = useReactTable({
    data: pods,
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
      columnVisibility: colVisibility,
    },
    // Add this to enable column visibility state
    onColumnVisibilityChange: setColVisibility,
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
                  .filter((column) =>
                    ['name', 'phase', 'nodeName'].includes(column.id)
                  )
                  .map((column) => {
                    return (
                      <div key={column.id}>
                        <Input
                          placeholder={`Filter ${column.id.split('.').pop()}...`}
                          value={(column.getFilterValue() as string) ?? ''}
                          autoComplete='off'
                          autoCorrect="off"
                          autoCapitalize="off"
                          onChange={(e) =>
                            column.setFilterValue(e.target.value)
                          }
                          className="max-w-xs"
                        />
                      </div>
                    );
                  })}
                {namespaces.length > 1 && (
                  <div>
                    <Select
                      onValueChange={(value) => {
                        const namespaceColumn = table.getColumn('namespace');
                        if (namespaceColumn) {
                          namespaceColumn.setFilterValue(value || undefined);
                        }
                      }}
                    >
                      <SelectTrigger className="max-w-xs">
                        <SelectValue placeholder="Filter namespace..." />
                      </SelectTrigger>
                      <SelectContent>
                        {namespaces.map((namespace) => (
                          <SelectItem key={namespace} value={namespace}>
                            {namespace}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    No pods found.
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
