import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { V1Pod } from '@kubernetes/client-node';

interface PodViewProps {
  pod: V1Pod | null;
}

export const PodView = ({ pod }: PodViewProps) => {
  if (!pod) return null;

  const { metadata, status, spec } = pod;
  const podName = metadata?.name || 'N/A';
  const namespace = metadata?.namespace || 'N/A';
  const podIP = status?.podIP || 'N/A';
  const nodeName = spec?.nodeName || 'N/A';
  const phase = status?.phase || 'N/A';

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{podName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>Namespace:</strong> {namespace}
          </div>
          <div>
            <strong>Status:</strong> {phase}
          </div>
          <div>
            <strong>Pod IP:</strong> {podIP}
          </div>
          <div>
            <strong>Node:</strong> {nodeName}
          </div>
          {status?.containerStatuses && status.containerStatuses.length > 0 && (
            <div>
              <strong>Containers:</strong>
              <ul className="list-disc ml-5">
                {status.containerStatuses.map((cs, index) => (
                  <li key={index}>
                    {cs.name}: Restart Count {cs.restartCount}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
