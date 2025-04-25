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
import { StatusBadge } from '@/components/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { arrayToLabelSelector, labelSelectorToArray } from '@/lib/labels';
import { getAge } from '@/lib/time';

interface NodesTableProps {
  nodes: Array<V1Node>;
  initialFilters: {
    name: string;
    labelSelector: string;
  };
}

export const NodesTable = ({ nodes, initialFilters }: NodesTableProps) => {
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
  const [columnVisibility, setColumnVisibility] = useState<{
    [key: string]: boolean;
  }>({ labels: false });

  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    nodes.forEach((node) => {
      const labels = node.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [nodes]);

  const statusOptions = useMemo(() => {
    const statusSet = new Set<string>();
    nodes.forEach((node) => {
      const conditions = node.status?.conditions || [];
      conditions.forEach((condition) => {
        statusSet.add(`${condition.type}=${condition.status}`);
      });
    });
    return Array.from(statusSet).map((status) => ({
      label: status,
      value: status,
    }));
  }, [nodes]);

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
        const readyCondition = conditions.find((c) => c.type === 'Ready');
        const status = readyCondition?.status === 'True' ? 'Ready' : 'NotReady';
        return <StatusBadge status={status} />;
      },
      filterFn: (row, _, filterValue) => {
        const conditions = row.original.status?.conditions || [];
        if (!filterValue) return true;

        const statusSelectors = (filterValue as string)
          .split(',')
          .filter(Boolean);

        if (statusSelectors.length === 0) return true;

        return statusSelectors.every((selector) => {
          const [type, status] = selector.split('=');
          return conditions.some(
            (condition) =>
              condition.type === type && condition.status === status
          );
        });
      },
    },
    {
      id: 'roles',
      accessorKey: 'metadata.labels',
      header: ({ column }) => <SortableHeader column={column} title="Roles" />,
      cell: ({ row }) => {
        const labels = row.original.metadata?.labels || {};
        const roles = [];
        if (labels['node-role.kubernetes.io/control-plane'])
          roles.push('Control Plane');
        if (labels['node-role.kubernetes.io/master']) roles.push('Master');
        if (labels['node-role.kubernetes.io/worker']) roles.push('Worker');
        return roles.join(', ') || 'Worker';
      },
    },
    {
      id: 'version',
      accessorKey: 'status.nodeInfo.kubeletVersion',
      header: ({ column }) => (
        <SortableHeader column={column} title="Version" />
      ),
      cell: ({ row }) => row.original.status?.nodeInfo?.kubeletVersion,
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
    {
      id: 'scheduling',
      accessorFn: (row) => {
        const unschedulable = row.spec?.unschedulable;
        const taints = row.spec?.taints || [];
        if (unschedulable) return 'Disabled';
        if (taints.length > 0) return 'Tainted';
        return 'Enabled';
      },
      header: ({ column }) => (
        <SortableHeader column={column} title="Scheduling" />
      ),
      cell: ({ row }) => {
        const value = row.getValue('scheduling') as string;
        return <StatusBadge status={value} />;
      },
      filterFn: (row, _, filterValue) => {
        if (!filterValue) return true;
        return row.getValue('scheduling') === filterValue;
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
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <Input
                    placeholder="Filter name..."
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
                  <Select
                    onValueChange={(value) => {
                      const column = table.getColumn('scheduling');
                      if (column) {
                        column.setFilterValue(value || undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Filter scheduling..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enabled">Enabled</SelectItem>
                      <SelectItem value="Disabled">Disabled</SelectItem>
                      <SelectItem value="Tainted">Tainted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <MultiSelect
                    options={statusOptions}
                    placeholder="Filter by status..."
                    defaultValue={[]}
                    onValueChange={(values) => {
                      const statusColumn = table.getColumn('status');
                      if (statusColumn) {
                        statusColumn.setFilterValue(values.join(','));
                      }
                    }}
                    className="max-w-xs"
                  />
                </div>
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
