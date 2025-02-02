import { Link } from 'react-router';
import { V1Deployment } from '@kubernetes/client-node';
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

interface DeploymentsTableProps {
  deployments: Array<V1Deployment>;
}

export const DeploymentsTable = ({ deployments }: DeploymentsTableProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<V1Deployment>[] = [
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
          <Link to={`/namespaces/${namespace}/deployments/${name}`}>
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
      accessorKey: 'status.replicas',
      header: ({ column }) => (
        <SortableHeader column={column} title="Replicas" />
      ),
      cell: ({ row }) =>
        `${row.original.status?.availableReplicas ?? 0}/${row.original.spec?.replicas ?? 0}`,
    },
    {
      accessorKey: 'status.updatedReplicas',
      header: ({ column }) => (
        <SortableHeader column={column} title="Up-to-date" />
      ),
      cell: ({ row }) => row.original.status?.updatedReplicas ?? 0,
    },
    {
      accessorKey: 'status.availableReplicas',
      header: ({ column }) => (
        <SortableHeader column={column} title="Available" />
      ),
      cell: ({ row }) => row.original.status?.availableReplicas ?? 0,
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
    data: deployments,
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
                      No deployments found.
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
