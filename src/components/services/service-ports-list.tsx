import { V1ServicePort } from '@kubernetes/client-node';
import { Badge } from '@/components/ui/badge';

interface ServicePortsListProps {
  ports?: V1ServicePort[];
}

export const ServicePortsList = ({ ports }: ServicePortsListProps) => {
  if (!ports || ports.length === 0) {
    return <span>None</span>;
  }

  return (
    <ul className="list-none p-0 m-0 space-y-1">
      {ports.map((port, index) => (
        <li key={index} className="flex items-center space-x-1 text-xs">
          {port.name && (
            <Badge variant="secondary" className="font-normal">
              {port.name}
            </Badge>
          )}
          <span>{port.port}</span>
          {port.nodePort && <span>:{port.nodePort}</span>}
          <span>/</span>
          <Badge variant="outline" className="font-normal">
            {port.protocol || 'TCP'}
          </Badge>
          {port.targetPort && (
            <>
              <span>&rarr;</span>
              <span>{port.targetPort}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};
