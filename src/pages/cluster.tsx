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
import { ArrowLeftIcon, SparklesIcon, TerminalSquareIcon } from 'lucide-react';
import { useOpenClusterInfo } from '@/hooks/use-open-cluster-info';
import { ROUTES } from '@/lib/routes';

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

  const { mutate: openClusterInfo } = useOpenClusterInfo({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeftIcon />
          Back to config
        </Button>
      </div>

      <ConfigurationCard
        kubeconfigPath={selectedKubeconfig ?? ''}
        context={currentContext ?? ''}
      />

      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <Spinner />
          <p className="text-sm text-gray-600">
            Loading cluster information...
          </p>
        </div>
      )}
      {error && (
        <div className="space-y-4">
          <ErrorAlert error={error} />
          <div className="flex justify-center space-x-2">
            <Button onClick={() => openClusterInfo()}>
              <TerminalSquareIcon /> kubectl cluster-info
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              Back to config
            </Button>
          </div>
        </div>
      )}
      {!isLoading && !error && content && (
        <>
          <ClusterContent content={content} />
          <div className="flex flex-col items-center mt-4">
            <Button
              onClick={() => navigate(ROUTES.AI_CONFIG)}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-700"
            >
              Configure AI <SparklesIcon className="ml-2" />
            </Button>
            <p className="text-center text-sm mt-2 text-gray-500 dark:text-gray-400">
              Configuring the AI helps troubleshoot pods & containers
              effortlessly.
            </p>
          </div>
        </>
      )}
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
  <Card className="max-w-xl mx-auto bg-gray-50 border border-gray-200 shadow-md">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Current Configuration
      </CardTitle>
      <CardDescription className="text-sm text-gray-600">
        Your active Kubernetes configuration.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="font-medium text-gray-700">Kubeconfig:</span>
          <span className="ml-2 text-xs font-bold text-gray-900 truncate">
            {kubeconfigPath}
          </span>
        </div>
        <div className="flex items-center">
          <span className="font-medium text-gray-700">Context:</span>
          <span className="ml-2 text-xs font-bold text-gray-900 truncate">
            {context}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
);
