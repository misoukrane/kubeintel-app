import { V1Container, V1ContainerStatus } from "@kubernetes/client-node";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "../status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContainersStatusTableProps {
  initContainers?: V1Container[];
  containers?: V1Container[];
  containerStatuses?: V1ContainerStatus[];
}

const ContainerTable = ({ containers, statuses }: {
  containers?: V1Container[],
  statuses?: V1ContainerStatus[]
}) => {
  const getStatusForContainer = (name: string) =>
    statuses?.find(s => s.name === name);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Restarts</TableHead>
          <TableHead>Ready</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {containers?.map((container) => {
          const status = getStatusForContainer(container.name);
          return (
            <TableRow key={container.name}>
              <TableCell className="font-medium">
                {container.name}
              </TableCell>
              <TableCell className="text-xs">{container.image}</TableCell>
              <TableCell>
                <StatusBadge
                  status={
                    status
                      ? Object.keys(status.state || {})[0] || 'Unknown'
                      : 'Pending'
                  }
                />
              </TableCell>
              <TableCell>{status?.restartCount || 0}</TableCell>
              <TableCell>
                <Badge variant={status?.ready ? "default" : "destructive"}>
                  {status?.ready ? 'Yes' : 'No'}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export const ContainersStatusTable = ({
  initContainers,
  containers,
  containerStatuses
}: ContainersStatusTableProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Containers</CardTitle>
        </CardHeader>
        <CardContent>
          <ContainerTable
            containers={containers}
            statuses={containerStatuses}
          />
        </CardContent>
      </Card>

      {initContainers && initContainers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Init Containers</CardTitle>
          </CardHeader>
          <CardContent>
            <ContainerTable
              containers={initContainers}
              statuses={containerStatuses}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};