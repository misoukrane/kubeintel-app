import { Link } from 'react-router';
import { V1PersistentVolumeClaim } from '@kubernetes/client-node';
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
import { arrayToLabelSelector, labelSelectorToArray } from '@/lib/labels';
import { getAge } from '@/lib/time';

interface PersistentVolumeClaimsTableProps {
  namespace: string;
  persistentVolumeClaims: Array<V1PersistentVolumeClaim>;
  initialFilters: {
    name: string;
    labelSelector: string;
  };
}

export const PersistentVolumeClaimsTable = ({ 
  namespace,
  persistentVolumeClaims, 
  initialFilters 
}: PersistentVolumeClaimsTableProps) => {
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
    persistentVolumeClaims.forEach((pvc) => {
      const labels = pvc.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [persistentVolumeClaims]);

  const statusOptions = useMemo(() => {
    const statusSet = new Set<string>();
    persistentVolumeClaims.forEach((pvc) => {
      if (pvc.status?.phase) {
        statusSet.add(pvc.status.phase);
      }
    });
    return Array.from(statusSet).map((status) => ({
      label: status,
      value: status,
    }));
  }, [persistentVolumeClaims]);

  const storageClassOptions = useMemo(() => {
    const storageClassSet = new Set<string>();
    persistentVolumeClaims.forEach((pvc) => {
      if (pvc.spec?.storageClassName) {
        storageClassSet.add(pvc.spec.storageClassName);
      }
    });
    return Array.from(storageClassSet).map((storageClass) => ({
      label: storageClass,
      value: storageClass,
    }));
  }, [persistentVolumeClaims]);

  const columns: ColumnDef<V1PersistentVolumeClaim>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name;
        return (
          <Link to={`/namespaces/${namespace}/persistent-volume-claims/${name}`}>
            <Button variant="link" className="underline">
              {name}
            </Button>
          </Link>
        );
      },
    },
    {
      id: 'status',
      accessorKey: 'status.phase',
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const phase = row.original.status?.phase || 'Unknown';
        return <StatusBadge status={phase} />;
      },
      filterFn: (row, _, filterValue) => {
        const phase = row.original.status?.phase || 'Unknown';
        if (!filterValue) return true;

        const statusSelectors = (filterValue as string)
          .split(',')
          .filter(Boolean);

        if (statusSelectors.length === 0) return true;
        return statusSelectors.includes(phase);
      },
    },
    {
      id: 'storageClass',
      accessorKey: 'spec.storageClassName',
      header: ({ column }) => <SortableHeader column={column} title="Storage Class" />,
      cell: ({ row }) => row.original.spec?.storageClassName || 'N/A',
      filterFn: (row, _, filterValue) => {
        const storageClass = row.original.spec?.storageClassName || '';
        if (!filterValue) return true;

        const storageClassSelectors = (filterValue as string)
          .split(',')
          .filter(Boolean);

        if (storageClassSelectors.length === 0) return true;
        return storageClassSelectors.includes(storageClass);
      },
    },
    {
      id: 'capacity',
      accessorKey: 'spec.resources.requests',
      header: ({ column }) => <SortableHeader column={column} title="Capacity" />,
      cell: ({ row }) => {
        const storage = row.original.spec?.resources?.requests?.['storage'] || 'N/A';
        return storage;
      },
    },
    {
      id: 'accessModes',
      accessorKey: 'spec.accessModes',
      header: ({ column }) => <SortableHeader column={column} title="Access Modes" />,
      cell: ({ row }) => {
        const accessModes = row.original.spec?.accessModes || [];
        return accessModes.join(', ');
      },
    },
    {
      id: 'volumeName',
      accessorKey: 'spec.volumeName',
      header: ({ column }) => <SortableHeader column={column} title="Volume" />,
      cell: ({ row }) => {
        const volumeName = row.original.spec?.volumeName;
        if (!volumeName) return 'N/A';
        
        return (
          <Link to={`/persistent-volumes/${volumeName}`}>
            <Button variant="link" className="underline">
              {volumeName}
            </Button>
          </Link>
        );
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
    data: persistentVolumeClaims,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      sorting,
      pagination,
      columnVisibility,
    },
    onSortingChange: setSorting,
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
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
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
                    options={storageClassOptions}
                    placeholder="Filter by storage class..."
                    defaultValue={[]}
                    onValueChange={(values) => {
                      const storageClassColumn = table.getColumn('storageClass');
                      if (storageClassColumn) {
                        storageClassColumn.setFilterValue(values.join(','));
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
                    No persistent volume claims found.
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