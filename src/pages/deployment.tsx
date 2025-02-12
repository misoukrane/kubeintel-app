import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentView } from '@/components/deployments/deployment-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Deployment } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/use-get-kube-resource';
import { useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useOpenEventsResource } from '@/hooks/use-open-events-resource';
import { useDeleteKubeResource } from '@/hooks/use-delete-kube-resource';
import { useScaleKubeResource } from '@/hooks/use-scale-kube-resource';
import { useRestartKubeResource } from '@/hooks/use-restart-kube-resource';
import { useLogsKubeResource } from '@/hooks/use-logs-kube-resource';

export const Deployment = () => {
  const { deploymentName } = useParams();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: resource,
    isLoading,
    error,
  } = useGetKubeResource<V1Deployment>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    name: deploymentName,
    resourceType: 'deployment',
  });

  const { openEvents } = useOpenEventsResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resource: 'deployment',
    name: deploymentName,
  });

  const { mutate: deleteResource } = useDeleteKubeResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'deployment',
    name: deploymentName,
  });

  const { mutate: scaleResource } = useScaleKubeResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'deployment',
    name: deploymentName,
  });

  const { mutate: restartResource } = useRestartKubeResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'deployment',
    name: deploymentName,
  });

  const { mutate: openLogs } = useLogsKubeResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resource: 'deployment',
    name: deploymentName,
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DeploymentView
          deployment={resource}
          onCopy={copyToClipboard}
          onScale={async (currentReplicas: number, replicas: number) => {
            await scaleResource({ currentReplicas, replicas });
          }}
          onDelete={async () => {
            await deleteResource();
          }}
          onRestart={async () => {
            await restartResource();
          }}
          onLogs={async (containerName?: string) => {
            await openLogs(containerName);
          }}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
