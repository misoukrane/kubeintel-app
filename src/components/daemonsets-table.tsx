import { Link } from 'react-router';
import { V1DaemonSet } from '@kubernetes/client-node';
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
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SortableHeader } from '@/components/table/sortable-header';

interface DaemonsetsTableProps {
  daemonsets: Array<V1DaemonSet>;
}

export const DaemonsetsTable = ({ daemonsets }: DaemonsetsTableProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<V1DaemonSet>[] = [
    {
      accessorKey: 'metadata.name',
      header: ({ column }) => (
        <div>
          <SortableHeader column={column} title="Name" />
        </div>
      ),
      cell: ({ row }) => {
        const name = row.original.metadata?.name;
        const namespace = row.original.metadata?.namespace;
        return (
          <Link to={`/namespaces/${namespace}/daemonsets/${name}`}>
            <Button variant="link" className="underline">
              {name}
            </Button>
          </Link>
        );
      },
    },
    {
      accessorKey: 'metadata.namespace',
      header: ({ column }) => (
        <SortableHeader column={column} title="Namespace" />
      ),
      cell: ({ row }) => row.original.metadata?.namespace,
    },
    {
      accessorKey: 'status.desiredNumberScheduled',
      header: ({ column }) => (
        <SortableHeader column={column} title="Desired" />
      ),
      cell: ({ row }) => row.original.status?.desiredNumberScheduled ?? 0,
    },
    {
      accessorKey: 'status.currentNumberScheduled',
      header: ({ column }) => (
        <SortableHeader column={column} title="Current" />
      ),
      cell: ({ row }) => row.original.status?.currentNumberScheduled ?? 0,
    },
    {
      accessorKey: 'status.numberReady',
      header: ({ column }) => <SortableHeader column={column} title="Ready" />,
      cell: ({ row }) => row.original.status?.numberReady ?? 0,
    },
    {
      accessorKey: 'status.updatedNumberScheduled',
      header: ({ column }) => (
        <SortableHeader column={column} title="Up-to-date" />
      ),
      cell: ({ row }) => row.original.status?.updatedNumberScheduled ?? 0,
    },
    {
      accessorKey: 'status.numberAvailable',
      header: ({ column }) => (
        <SortableHeader column={column} title="Available" />
      ),
      cell: ({ row }) => row.original.status?.numberAvailable ?? 0,
    },
    {
      accessorKey: 'metadata.creationTimestamp',
      header: ({ column }) => <SortableHeader column={column} title="Age" />,
      cell: ({ row }) => {
        const timestamp = row.original.metadata?.creationTimestamp;
        return timestamp ? new Date(timestamp).toLocaleString() : '';
      },
    },
  ];

  const table = useReactTable({
    data: daemonsets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Filters</AccordionTrigger>
                <AccordionContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {table
                      .getAllColumns()
                      .filter((column) => ['metadata_name'].includes(column.id))
                      .map((column) => {
                        return (
                          <div key={column.id}>
                            <Input
                              placeholder={`Filter ${column.id.split('_').pop()}...`}
                              value={(column.getFilterValue() as string) ?? ''}
                              onChange={(e) =>
                                column.setFilterValue(e.target.value)
                              }
                              className="max-w-xs "
                            />
                          </div>
                        );
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
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
                      No daemonsets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
