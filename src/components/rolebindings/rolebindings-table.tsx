import { V1RoleBinding } from '@kubernetes/client-node';
import { Card, CardContent } from '@/components/ui/card';
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
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/table/sortable-header';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { getAge } from '@/lib/time';
import { arrayToLabelSelector, labelSelectorToArray } from '@/lib/labels';
import { Badge } from '@/components/ui/badge';
import { Link2 } from 'lucide-react';

interface RoleBindingsTableProps {
  roleBindings: Array<V1RoleBinding>;
  initialFilters?: {
    name: string;
    labelSelector: string;
  };
  navigateToRoleBinding?: (namespace: string, name: string) => void;
  columnVisibility?: VisibilityState;
}

export const RoleBindingsTable = ({
  roleBindings,
  initialFilters = { name: '', labelSelector: '' },
  navigateToRoleBinding,
  columnVisibility = {},
}: RoleBindingsTableProps) => {
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
    ...columnVisibility,
  });

  // Add useEffect to update visibility when props change
  useEffect(() => {
    setVisibility(prev => ({
      ...prev,
      ...columnVisibility,
    }));
  }, [columnVisibility]);

  // Create unique label options from all roleBindings
  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    roleBindings.forEach((roleBinding) => {
      const labels = roleBinding.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [roleBindings]);

  const columns: ColumnDef<V1RoleBinding>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name || '';
        const namespace = row.original.metadata?.namespace || '';

        return (
          <div className="flex items-center">
            <Link2 className="h-4 w-4 mr-2 text-blue-500" />
            <Button
              variant="link"
              className="underline"
              onClick={() =>
                navigateToRoleBinding
                  ? navigateToRoleBinding(namespace, name)
                  : null
              }
            >
              {name}
            </Button>
          </div>
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
      id: 'subjects',
      header: ({ column }) => <SortableHeader column={column} title="Subjects" />,
      cell: ({ row }) => {
        const subjects = row.original.subjects || [];
        return subjects.length > 0
          ? subjects
              .map(
                (subject) =>
                  `${subject.kind}/${subject.name}${
                    subject.namespace ? ` (${subject.namespace})` : ''
                  }`
              )
              .join(', ')
          : 'None';
      },
    },
    {
      id: 'roleRef',
      header: ({ column }) => <SortableHeader column={column} title="References" />,
      cell: ({ row }) => {
        const roleRef = row.original.roleRef;
        return roleRef
          ? `${roleRef.kind}/${roleRef.name}`
          : 'Not defined';
      },
    },
    {
      id: 'age',
      header: ({ column }) => <SortableHeader column={column} title="Age" />,
      cell: ({ row }) => {
        const creationTimestamp = row.original.metadata?.creationTimestamp;
        return creationTimestamp ? getAge(new Date(creationTimestamp)) : 'N/A';
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.metadata?.creationTimestamp
          ? new Date(rowA.original.metadata.creationTimestamp).getTime()
          : 0;
        const dateB = rowB.original.metadata?.creationTimestamp
          ? new Date(rowB.original.metadata.creationTimestamp).getTime()
          : 0;
        return dateA - dateB;
      },
    },
    {
      id: 'labels',
      header: ({ column }) => (
        <SortableHeader column={column} title="Labels" />
      ),
      cell: ({ row }) => {
        const labels = row.original.metadata?.labels || {};
        return Object.entries(labels).length > 0
          ? Object.entries(labels).map(([key, value]) => (
              <Badge key={key} variant="outline" className="mr-1 mb-1">
                {key}={value}
              </Badge>
            ))
          : 'None';
      },
      filterFn: (row, id, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        const labels = row.original.metadata?.labels || {};

        // Convert filterValue to array of key=value strings
        const filterLabels = Array.isArray(filterValue)
          ? filterValue
          : typeof filterValue === 'string'
          ? labelSelectorToArray(filterValue)
          : [];

        // Check if all filter labels are present in the row's labels
        return filterLabels.every((filter) => {
          const [key, value] = filter.split('=');
          return labels[key] === value;
        });
      },
    },
  ];

  const table = useReactTable({
    data: roleBindings,
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
      <CardContent className="pt-6">
        <div className="flex items-center justify-between py-4 space-x-2">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Filter by name..."
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(e) =>
                table.getColumn('name')?.setFilterValue(e.target.value)
              }
              className="max-w-xs"
            />
            {labelOptions.length > 0 && (
              <MultiSelect
                placeholder="Filter by labels..."
                selected={
                  typeof table.getColumn('labels')?.getFilterValue() === 'string'
                    ? labelSelectorToArray(
                        table.getColumn('labels')?.getFilterValue() as string
                      )
                    : (table.getColumn('labels')?.getFilterValue() as string[]) || []
                }
                options={labelOptions}
                onChange={(selected) => {
                  // Apply the selected labels as filters
                  table
                    .getColumn('labels')
                    ?.setFilterValue(arrayToLabelSelector(selected));
                }}
                className="max-w-xs"
              />
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibility({ ...visibility, labels: !visibility.labels })}
            >
              {visibility.labels ? 'Hide Labels' : 'Show Labels'}
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
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
                    No RoleBindings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <DataTablePagination table={table} />
        </div>
      </CardContent>
    </Card>
  );
}; 