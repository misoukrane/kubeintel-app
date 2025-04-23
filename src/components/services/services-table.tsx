import { V1Service } from '@kubernetes/client-node';
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
import { Badge } from '@/components/ui/badge';
import { Network } from 'lucide-react';
import { getExternalAddresses, getPortsString } from '@/lib/services';

interface ServicesTableProps {
  services: Array<V1Service>;
  initialFilters?: {
    name: string;
    type?: string;
    labelSelector: string;
  };
  navigateToService?: (namespace: string, name: string) => void;
  columnVisibility?: VisibilityState;
}

export const ServicesTable = ({
  services,
  initialFilters = { name: '', type: '', labelSelector: '' },
  navigateToService,
  columnVisibility = {},
}: ServicesTableProps) => {
  // Create initial filters array
  const initialColumnFilters: ColumnFiltersState = [
    ...(initialFilters.name
      ? [{ id: 'name', value: initialFilters.name }]
      : []),
    ...(initialFilters.type
      ? [{ id: 'type', value: initialFilters.type }]
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

  // Create unique label options from all services
  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    services.forEach((service) => {
      const labels = service.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map((label) => ({
      label,
      value: label,
    }));
  }, [services]);

  // Create unique type options from all services
  const typeOptions = useMemo(() => {
    const typeSet = new Set<string>();
    services.forEach((service) => {
      if (service.spec?.type) {
        typeSet.add(service.spec.type);
      }
    });
    return Array.from(typeSet).map((type) => ({
      label: type,
      value: type,
    }));
  }, [services]);

  // Get cluster IP
  const getClusterIP = (service: V1Service): string => {
    if (service.spec?.type === 'ExternalName') {
      return service.spec.externalName || 'N/A';
    }
    return service.spec?.clusterIP || 'None';
  };

  // Badge for Service type
  const ServiceTypeBadge = ({ type }: { type: string }) => {
    switch (type) {
      case 'ClusterIP':
        return <Badge variant="outline">ClusterIP</Badge>;
      case 'NodePort':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            NodePort
          </Badge>
        );
      case 'LoadBalancer':
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
          >
            LoadBalancer
          </Badge>
        );
      case 'ExternalName':
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            ExternalName
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const columns: ColumnDef<V1Service>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = row.original.metadata?.name || '';
        const namespace = row.original.metadata?.namespace || '';

        return (
          <div className="flex items-center">
            <Network className="h-4 w-4 mr-2 text-blue-500" />
            <Button
              variant="link"
              className="underline"
              onClick={() =>
                navigateToService ? navigateToService(namespace, name) : null
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
      id: 'type',
      accessorKey: 'spec.type',
      header: ({ column }) => <SortableHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const type = row.original.spec?.type || 'ClusterIP';
        return <ServiceTypeBadge type={type} />;
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const type = (row.getValue(columnId) as string) || 'ClusterIP';
        return type === filterValue;
      },
    },
    {
      id: 'clusterIP',
      accessorKey: 'spec.clusterIP',
      header: ({ column }) => (
        <SortableHeader column={column} title="Cluster IP" />
      ),
      cell: ({ row }) => getClusterIP(row.original),
    },
    {
      id: 'ports',
      header: ({ column }) => <SortableHeader column={column} title="Ports" />,
      cell: ({ row }) => {
        const portsString = getPortsString(row.original);
        return portsString || 'None';
      },
    },
    {
      id: 'external',
      header: ({ column }) => (
        <SortableHeader column={column} title="External IP" />
      ),
      cell: ({ row }) => {
        const externalAddresses = getExternalAddresses(row.original);
        return externalAddresses || 'None';
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
    data: services,
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
                    autoComplete='off'
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </div>
                <div>
                  <MultiSelect
                    options={typeOptions}
                    placeholder="Filter by type..."
                    defaultValue={
                      initialFilters.type ? [initialFilters.type] : []
                    }
                    onValueChange={(values) => {
                      if (values.length > 0) {
                        table.getColumn('type')?.setFilterValue(values[0]);
                      } else {
                        table.getColumn('type')?.setFilterValue(undefined);
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
                    No Services found.
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
