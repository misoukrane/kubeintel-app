import { V1PodCondition } from "@kubernetes/client-node";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StatusConditionsTableProps {
  conditions: V1PodCondition[];
}

export const StatusConditionsTable = ({ conditions }: StatusConditionsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Transition</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conditions.map((condition, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{condition.type}</TableCell>
            <TableCell>
              <Badge
                variant={condition.status === 'True' ? 'default' : 'destructive'}
              >
                {condition.status}
              </Badge>
            </TableCell>
            <TableCell>
              {condition.lastTransitionTime
                ? new Date(condition.lastTransitionTime).toLocaleString()
                : 'N/A'}
            </TableCell>
            <TableCell className="max-w-md truncate">
              {condition.message || 'No message'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};