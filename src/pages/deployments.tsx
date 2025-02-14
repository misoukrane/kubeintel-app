import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentsTable } from '@/components/deployments/deployments-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Deployment } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const Deployments = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: deployments,
    isLoading,
    error,
  } = useListKubeResource<V1Deployment>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.Deployment,
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DeploymentsTable deployments={deployments ?? []} />
      )}
    </div>
  );
};
