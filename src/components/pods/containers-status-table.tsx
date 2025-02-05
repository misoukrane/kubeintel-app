import { V1ContainerStatus } from "@kubernetes/client-node";
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

interface ContainersStatusTableProps {
  containerStatuses: V1ContainerStatus[];
}

export const ContainersStatusTable = ({ containerStatuses }: ContainersStatusTableProps) => {
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
        {containerStatuses.map((container) => (
          <TableRow key={container.name}>
            <TableCell className="font-medium">{container.name}</TableCell>
            <TableCell className="text-xs">{container.image}</TableCell>
            <TableCell>
              <StatusBadge status={Object.keys(container.state || {})[0] || 'Unknown'} />
            </TableCell>
            <TableCell>{container.restartCount}</TableCell>
            <TableCell>
              <Badge variant={container.ready ? "default" : "destructive"}>
                {container.ready ? 'Yes' : 'No'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};