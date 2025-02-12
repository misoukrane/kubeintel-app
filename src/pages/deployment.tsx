import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentView } from '@/components/deployments/deployment-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Deployment } from '@kubernetes/client-node';
import { useNavigate, useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/use-kube-resource';

export const Deployment = () => {
  const { deploymentName } = useParams();
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();
  const { copyToClipboard } = useClipboard();

  const {
    resource: deployment,
    isLoading,
    error,
    deleteResource,
    openLogs,
    openEvents,
    restartResource,
    scaleResource,
  } = useKubeResource<V1Deployment>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'deployment',
    name: deploymentName,
    onDeleteSuccess: () => navigate('/deployments'),
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DeploymentView
          deployment={deployment}
          onCopy={copyToClipboard}
          onScale={(params) => {
            scaleResource(params);
          }}
          onDelete={deleteResource}
          onRestart={restartResource}
          onLogs={(containerName?: string) => openLogs(containerName)}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
