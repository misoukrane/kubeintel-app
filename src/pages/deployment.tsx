import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentView } from '@/components/deployments/deployment-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Deployment } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/use-get-kube-resource';
import { useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';

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

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert message={error.message} />}
      {!isLoading && !error && (
        <DeploymentView deployment={resource} onCopy={copyToClipboard} />
      )}
    </div>
  );
};
