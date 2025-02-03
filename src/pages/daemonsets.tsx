import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DaemonsetsTable } from '@/components/daemonsets-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1DaemonSet } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/use-list-kube-resource';

export const Daemonsets = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resources, loading, error } = useListKubeResource<V1DaemonSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'daemonsets',
  });

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <DaemonsetsTable daemonsets={resources} />}
    </div>
  );
};
