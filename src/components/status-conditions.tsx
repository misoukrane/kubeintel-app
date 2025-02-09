import { V1DeploymentCondition } from '@kubernetes/client-node';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DeploymentStatusConditionsProps {
  conditions: V1DeploymentCondition[];
}

export const StatusConditions = ({
  conditions,
}: DeploymentStatusConditionsProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Update</TableHead>
          <TableHead>Last Transition</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conditions.map((condition, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{condition.type}</TableCell>
            <TableCell>
              <Badge
                variant={
                  condition.status === 'True' ? 'default' : 'destructive'
                }
              >
                {condition.status}
              </Badge>
            </TableCell>
            <TableCell className="text-xs">
              {condition.lastUpdateTime
                ? new Date(condition.lastUpdateTime).toLocaleString()
                : 'N/A'}
            </TableCell>
            <TableCell className="text-xs">
              {condition.lastTransitionTime
                ? new Date(condition.lastTransitionTime).toLocaleString()
                : 'N/A'}
            </TableCell>
            <TableCell className="text-xs">
              {condition.reason || 'N/A'}
            </TableCell>
            <TableCell className="max-w-md truncate text-xs">
              {condition.message || 'No message'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
