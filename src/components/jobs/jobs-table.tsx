import { Link } from 'react-router';
import { V1Job, V1JobStatus } from '@kubernetes/client-node';
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
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/table/sortable-header';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { MultiSelect } from '@/components/ui/multi-select';
import { StatusBadge } from '../status-badge';

interface JobsTableProps {
  jobs: Array<V1Job>;
  initialFilters?: {
    name: string;
    labelSelector: string;
  };
}

export const JobsTable = ({
  jobs,
  initialFilters = { name: '', labelSelector: '' }
}: JobsTableProps) => {
  // Create initial filters array
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

  // Create unique label options from all jobs
  const labelOptions = useMemo(() => {
    const labelSet = new Set<string>();
    jobs.forEach(job => {
      const labels = job.metadata?.labels || {};
      Object.entries(labels).forEach(([key, value]) => {
        labelSet.add(`${key}=${value}`);
      });
    });
    return Array.from(labelSet).map(label => ({
      label,
      value: label,
    }));
  }, [jobs]);

  const labelSelectorToArray = (selector: string) =>
    selector.split(',').filter(Boolean);

  const arrayToLabelSelector = (array: string[]) =>
    array.join(',');

  // Helper function to get job status
  // Get job status
  const getJobStatus = (status: V1JobStatus | undefined) => {
    if (status?.succeeded && status.succeeded > 0) {
      return 'Succeeded'
    } else if (status?.failed && status.failed > 0) {
      return 'Failed'
    } else if (status?.active && status.active > 0) {
      return 'Active'
    }
    return 'Pending'
  };

  // Calculate job duration or age
  const getJobDuration = (job: V1Job) => {
    const startTime = job.status?.startTime ? new Date(job.status.startTime) : null;
    const completionTime = job.status?.completionTime ? new Date(job.status.completionTime) : null;

    if (startTime && completionTime) {
      // Job is complete, show duration
      const durationMs = completionTime.getTime() - startTime.getTime();
      return formatDuration(durationMs);
    } else if (startTime) {
      // Job is running, show duration so far
      const durationMs = new Date().getTime() - startTime.getTime();
      return `${formatDuration(durationMs)} (running)`;
    }
    return 'N/A';
  };

  // Format duration in a human-readable format
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Format creation timestamp as age
  const getAge = (timestamp: string | undefined) => {
    if (!timestamp) return '';

    const created = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return formatDuration(diffMs);
  };

  const columns: ColumnDef<V1Job>[] = [
    {
      id: 'name',
      accessorKey: 'metadata.name',
      header: ({ column }) => (
        <SortableHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.original.metadata?.name;
        return (
          <Link to={`/jobs/${name}`}>
            <Button variant="link" className="underline">
              {name}
            </Button>
          </Link>
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
      id: 'status',
      header: ({ column }) => (
        <SortableHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = getJobStatus(row.original.status);
        return (
          <StatusBadge status={status} />
        );
      },
      sortingFn: (rowA, rowB) => {
        const statusA = getJobStatus(rowA.original.status);
        const statusB = getJobStatus(rowB.original.status);
        return statusA.localeCompare(statusB);
      },
    },
    {
      id: 'completions',
      header: ({ column }) => (
        <SortableHeader column={column} title="Completions" />
      ),
      cell: ({ row }) => {
        const succeeded = row.original.status?.succeeded || 0;
        const completions = row.original.spec?.completions || 1;
        return `${succeeded}/${completions}`;
      },
    },
    {
      id: 'parallelism',
      accessorKey: 'spec.parallelism',
      header: ({ column }) => (
        <SortableHeader column={column} title="Parallelism" />
      ),
      cell: ({ row }) => row.original.spec?.parallelism || 1,
    },
    {
      id: 'duration',
      header: ({ column }) => (
        <SortableHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => getJobDuration(row.original),
      sortingFn: (rowA, rowB) => {
        const startTimeA = rowA.original.status?.startTime || '';
        const startTimeB = rowB.original.status?.startTime || '';
        return String(startTimeA).localeCompare(String(startTimeB));
      },
    },
    {
      id: 'age',
      accessorKey: 'metadata.creationTimestamp',
      header: ({ column }) => <SortableHeader column={column} title="Age" />,
      cell: ({ row }) => getAge(String(row.original.metadata?.creationTimestamp)),
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
    data: jobs,
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
      columnVisibility: { labels: false },
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
                      />
                    </div>
                  ))}
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
                    No jobs found.
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