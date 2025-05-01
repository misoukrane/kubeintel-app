import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentView } from '@/components/deployments/deployment-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Deployment } from '@kubernetes/client-node';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { useState, useRef } from 'react';

export const Deployment = () => {
  const { deploymentName } = useParams();
  const [searchParams] = useSearchParams();
  const deploymentNamespace = searchParams.get('namespace');

  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  // Store the namespace from when the component first mounted
  // But prioritize the namespace from URL if it exists
  const initialNamespaceRef = useRef(
    deploymentNamespace ||
      (currentNamespace && currentNamespace !== 'all' ? currentNamespace : '')
  );

  // Local namespace state used for API calls
  const [resourceNamespace] = useState<string>(initialNamespaceRef.current);

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
    namespace: resourceNamespace,
    resourceType: ResourceTypes.Deployment,
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
