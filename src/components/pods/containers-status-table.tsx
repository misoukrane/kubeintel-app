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
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu } from "lucide-react";
import { ContainerCommands } from "@/components/pods/container-commands";

interface ContainersStatusTableProps {
  containers?: V1Container[];
  containerStatuses?: V1ContainerStatus[];
  ephemeralContainers?: V1Container[];
  initContainers?: V1Container[];
  onOpenShell?: (containerName: string, shell: string) => void;
  onOpenLogs?: (containerName?: string) => void;
  onDebug?: (debugImage: string, target?: string) => void;
}

export const ContainersStatusTable = ({
  containers,
  containerStatuses,
  ephemeralContainers,
  initContainers,
  onOpenShell,
  onOpenLogs,
  onDebug,
}: ContainersStatusTableProps) => {

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Containers</CardTitle>
          </CardHeader>
          <CardContent>
            <ContainerTable
              containers={containers}
              statuses={containerStatuses}
              onOpenShell={onOpenShell}
              onOpenLogs={onOpenLogs}
              onDebug={onDebug}
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
                onOpenLogs={onOpenLogs}
              />
            </CardContent>
          </Card>
        )}

        {ephemeralContainers && ephemeralContainers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ephemeral Containers</CardTitle>
            </CardHeader>
            <CardContent>
              <ContainerTable
                containers={ephemeralContainers}
                statuses={containerStatuses}
                onOpenLogs={onOpenLogs}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

const ContainerTable = ({ containers, statuses, onOpenShell, onOpenLogs, onDebug }: {
  containers?: V1Container[],
  statuses?: V1ContainerStatus[],
  onOpenShell?: (containerName: string, shell: string) => void,
  onOpenLogs?: (containerName?: string) => void,
  onDebug?: (debugImage: string, target?: string) => void;
}) => {
  const getStatusForContainer = (name: string) =>
    statuses?.find(s => s.name === name);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Image</TableHead>
          {statuses && (
            <>
              <TableHead>State</TableHead>
              <TableHead>Restarts</TableHead>
              <TableHead>Ready</TableHead>
              <TableHead><Menu /></TableHead>
            </>
          )}
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
              {statuses && (
                <>
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
                  <TableCell>
                    <ContainerCommands
                      containerName={container.name}
                      onOpenShell={onOpenShell}
                      onOpenLogs={onOpenLogs}
                      onDebug={onDebug}
                    />
                  </TableCell>
                </>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
