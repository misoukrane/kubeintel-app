import { V1ClusterRole } from '@kubernetes/client-node';
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
  VisibilityState,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/table/sortable-header';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { getAge } from '@/lib/time';
import { arrayToLabelSelector, labelSelectorToArray } from '@/lib/labels';

interface ClusterRolesTableProps {
  clusterRoles: Array<V1ClusterRole>;
  initialFilters?: {
    name: string;
    labelSelector: string;
  };
  navigateToClusterRole?: (name: string) => void;
}

export const ClusterRolesTable = ({
  clusterRoles,
  initialFilters = { name: '', labelSelector: '' },
  navigateToClusterRole,
}: ClusterRolesTableProps) => {
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

  // Add visibility state
  const [visibility, setVisibility] = useState<VisibilityState>({
    labels: false,
  });

  // Create unique label options from all cluster roles
  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    clusterRoles.forEach((clusterRole) => {
      const labels = clusterRole.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [clusterRoles]);

  // Get resources string
  const getResourcesString = (clusterRole: V1ClusterRole): string => {
    if (!clusterRole.rules || clusterRole.rules.length === 0) return 'None';

    const resources = new Set<string>();
    clusterRole.rules.forEach((rule) => {
      if (rule.resources) {
        rule.resources.forEach((resource) => resources.add(resource));
      }
    });

    if (resources.size === 0) return 'None';
    return Array.from(resources).join(', ');
  };

  const columns: ColumnDef<V1ClusterRole>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name || '';

        return (
          <div className="flex items-center">
            <Button
              variant="link"
              className="underline"
              onClick={() =>
                navigateToClusterRole ? navigateToClusterRole(name) : null
              }
            >
              {name}
            </Button>
          </div>
        );
      },
    },
    {
      id: 'resources',
      header: ({ column }) => (
        <SortableHeader column={column} title="Resources" />
      ),
      cell: ({ row }) => {
        const resourcesString = getResourcesString(row.original);
        return resourcesString;
      },
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
    data: clusterRoles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
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
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Filters</AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="grid grid-cols-2 gap-4 mt-4">
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
                  />
                </div>
                <div>
                  <MultiSelect
                    placeholder="Filter by labels..."
                    options={labelOptions}
                    value={labelSelectorToArray(
                      (table.getColumn('labels')?.getFilterValue() as string) ??
                        ''
                    )}
                    onValueChange={(values) => {
                      const labelSelector = arrayToLabelSelector(values);
                      table.getColumn('labels')?.setFilterValue(labelSelector);
                    }}
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
                    className="cursor-pointer"
                    onClick={() => {
                      const name = row.original.metadata?.name || '';
                      if (navigateToClusterRole) {
                        navigateToClusterRole(name);
                      }
                    }}
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
