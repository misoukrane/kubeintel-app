import { V1Container, V1ContainerStatus } from "@kubernetes/client-node";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { EllipsisVertical, Logs, Menu, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button"

interface ContainersStatusTableProps {
  containers?: V1Container[];
  containerStatuses?: V1ContainerStatus[];
  ephemeralContainers?: V1Container[];
  initContainers?: V1Container[];
  onOpenShell?: (containerName: string, shell: string) => Promise<void>;
  onOpenLogs?: (containerName: string) => Promise<void>;
}

export const ContainersStatusTable = ({
  containers,
  containerStatuses,
  ephemeralContainers,
  initContainers,
  onOpenShell,
  onOpenLogs,
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

const ContainerTable = ({ containers, statuses, onOpenShell, onOpenLogs }: {
  containers?: V1Container[],
  statuses?: V1ContainerStatus[],
  onOpenShell?: (containerName: string, shell: string) => Promise<void>,
  onOpenLogs?: (containerName: string) => Promise<void>,
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
                    <ContainerMenu
                      containerName={container.name}
                      onOpenShell={onOpenShell}
                      onOpenLogs={onOpenLogs}
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


interface ContainerMenuProps {
  containerName: string;
  onOpenShell?: (containerName: string, shell: string) => Promise<void>;
  onOpenLogs?: (containerName: string) => Promise<void>;
}

const ContainerMenu = ({ containerName, onOpenShell, onOpenLogs }: ContainerMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <EllipsisVertical />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {onOpenShell && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Terminal className="mr-2" /> Shell
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onOpenShell(containerName, '/bin/sh')}>
                <span>/bin/sh</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenShell(containerName, '/bin/bash')}>
                <span>/bin/bash</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      )}
      {onOpenLogs && (
        <DropdownMenuItem onClick={() => onOpenLogs(containerName)}>
          <Logs className="mr-2" /> Logs
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);
