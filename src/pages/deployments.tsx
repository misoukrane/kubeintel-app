import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentsTable } from '@/components/deployments-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Deployment } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/use-list-kube-resource';

export const Deployments = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resources, loading, error } = useListKubeResource<V1Deployment>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'deployments',
  });

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <DeploymentsTable deployments={resources} />}
    </div>
  );
};
