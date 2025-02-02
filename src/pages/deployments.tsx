import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentsTable } from '@/components/deployments-table';
import { ErrorAlert } from '@/components/error-alert';
import { useListDeployments } from '@/hooks/ise-list-deployments';

export const Deployments = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { deployments, loading, error } = useListDeployments({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
  });

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <DeploymentsTable deployments={deployments} />}
    </div>
  );
};
