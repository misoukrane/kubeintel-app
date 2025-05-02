import { V1ClusterRoleBinding } from '@kubernetes/client-node';
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
import { ShieldCheck } from 'lucide-react';

interface ClusterRoleBindingsTableProps {
  clusterRoleBindings: Array<V1ClusterRoleBinding>;
  initialFilters?: {
    name: string;
    labelSelector: string;
  };
  navigateToClusterRoleBinding?: (name: string) => void;
}

export const ClusterRoleBindingsTable = ({
  clusterRoleBindings,
  initialFilters = { name: '', labelSelector: '' },
  navigateToClusterRoleBinding,
}: ClusterRoleBindingsTableProps) => {
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

  // Create unique label options from all cluster role bindings
  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    clusterRoleBindings.forEach((clusterRoleBinding) => {
      const labels = clusterRoleBinding.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [clusterRoleBindings]);

  // Get subjects string
  const getSubjectsString = (clusterRoleBinding: V1ClusterRoleBinding): string => {
    if (!clusterRoleBinding.subjects || clusterRoleBinding.subjects.length === 0) return 'None';
    
    return clusterRoleBinding.subjects.map(subject => {
      const kind = subject.kind || '';
      const name = subject.name || '';
      const namespace = subject.namespace ? `(${subject.namespace})` : '';
      return `${kind}/${name}${namespace}`;
    }).join(', ');
  };

  // Get role ref string
  const getRoleRefString = (clusterRoleBinding: V1ClusterRoleBinding): string => {
    if (!clusterRoleBinding.roleRef) return 'None';
    
    const kind = clusterRoleBinding.roleRef.kind || '';
    const name = clusterRoleBinding.roleRef.name || '';
    return `${kind}/${name}`;
  };

  const columns: ColumnDef<V1ClusterRoleBinding>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name || '';

        return (
          <div className="flex items-center">
            <ShieldCheck className="h-4 w-4 mr-2 text-purple-500" />
            <Button
              variant="link"
              className="underline"
              onClick={() =>
                navigateToClusterRoleBinding ? navigateToClusterRoleBinding(name) : null
              }
            >
              {name}
            </Button>
          </div>
        );
      },
    },
    {
      id: 'roleRef',
      header: ({ column }) => (
        <SortableHeader column={column} title="Role Ref" />
      ),
      cell: ({ row }) => {
        return getRoleRefString(row.original);
      },
    },
    {
      id: 'subjects',
      header: ({ column }) => (
        <SortableHeader column={column} title="Subjects" />
      ),
      cell: ({ row }) => {
        return getSubjectsString(row.original);
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
    data: clusterRoleBindings,
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
                      if (navigateToClusterRoleBinding) {
                        navigateToClusterRoleBinding(name);
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