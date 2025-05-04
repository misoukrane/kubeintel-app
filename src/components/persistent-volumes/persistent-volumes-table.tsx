import { Link } from 'react-router';
import { V1PersistentVolume } from '@kubernetes/client-node';
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

interface PersistentVolumesTableProps {
  persistentVolumes: Array<V1PersistentVolume>;
  initialFilters: {
    name: string;
    labelSelector: string;
  };
}

export const PersistentVolumesTable = ({ 
  persistentVolumes, 
  initialFilters 
}: PersistentVolumesTableProps) => {
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
    persistentVolumes.forEach((pv) => {
      const labels = pv.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [persistentVolumes]);

  const statusOptions = useMemo(() => {
    const statusSet = new Set<string>();
    persistentVolumes.forEach((pv) => {
      if (pv.status?.phase) {
        statusSet.add(pv.status.phase);
      }
    });
    return Array.from(statusSet).map((status) => ({
      label: status,
      value: status,
    }));
  }, [persistentVolumes]);

  const storageClassOptions = useMemo(() => {
    const storageClassSet = new Set<string>();
    persistentVolumes.forEach((pv) => {
      if (pv.spec?.storageClassName) {
        storageClassSet.add(pv.spec.storageClassName);
      }
    });
    return Array.from(storageClassSet).map((storageClass) => ({
      label: storageClass,
      value: storageClass,
    }));
  }, [persistentVolumes]);

  const columns: ColumnDef<V1PersistentVolume>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name;
        return (
          <Link to={`/persistent-volumes/${name}`}>
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
      accessorKey: 'spec.capacity',
      header: ({ column }) => <SortableHeader column={column} title="Capacity" />,
      cell: ({ row }) => {
        const storage = row.original.spec?.capacity?.['storage'] || 'N/A';
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
      id: 'reclaimPolicy',
      accessorKey: 'spec.persistentVolumeReclaimPolicy',
      header: ({ column }) => <SortableHeader column={column} title="Reclaim Policy" />,
      cell: ({ row }) => row.original.spec?.persistentVolumeReclaimPolicy || 'N/A',
    },
    {
      id: 'claim',
      accessorKey: 'spec.claimRef',
      header: ({ column }) => <SortableHeader column={column} title="Claim" />,
      cell: ({ row }) => {
        const claimRef = row.original.spec?.claimRef;
        if (!claimRef) return 'N/A';
        
        const namespace = claimRef.namespace;
        const name = claimRef.name;
        
        if (!namespace || !name) return 'N/A';
        
        return (
          <Link to={`/namespaces/${namespace}/persistent-volume-claims/${name}`}>
            <Button variant="link" className="underline">
              {namespace}/{name}
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
    data: persistentVolumes,
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
                    No persistent volumes found.
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