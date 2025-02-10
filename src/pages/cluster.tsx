import { Button } from '@/components/ui/button';
import { useConfigStore } from '@/stores/use-config-store';
import { useNavigate } from 'react-router';
import { Spinner } from '@/components/spinner';
import { useClusterInfo } from '@/hooks/use-cluster-info';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ErrorAlert } from '@/components/error-alert';

export const Cluster = () => {
  const { selectedKubeconfig, currentContext } = useConfigStore();
  const navigate = useNavigate();

  const {
    data: content,
    isLoading,
    error,
  } = useClusterInfo({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to config
        </Button>
      </div>

      <ConfigurationCard
        kubeconfigPath={selectedKubeconfig ?? ''}
        context={currentContext ?? ''}
      />

      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && content && <ClusterContent content={content} />}
    </div>
  );
};

interface ClusterContentProps {
  content: string;
}

const ClusterContent = ({ content }: ClusterContentProps) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
        {content}
      </pre>
    </div>
  </div>
);

interface ConfigurationCardProps {
  kubeconfigPath: string;
  context: string;
}

const ConfigurationCard = ({
  kubeconfigPath,
  context,
}: ConfigurationCardProps) => (
  <Card className="max-w-xl mx-auto">
    <CardHeader>
      <CardTitle>Current Configuration</CardTitle>
      <CardDescription>Your active Kubernetes configuration.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-1">
          <div className="font-medium">Kubeconfig:</div>
          <div className="col-span-2 text-xs font-bold">{kubeconfigPath}</div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="font-medium">Context:</div>
          <div className="col-span-2 text-xs font-bold">{context}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);
