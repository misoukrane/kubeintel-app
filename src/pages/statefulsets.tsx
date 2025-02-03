import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { StatefulSetsTable } from '@/components/statefulsets-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1StatefulSet } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/use-list-kube-resource';

export const StatefulSets = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resources, loading, error } = useListKubeResource<V1StatefulSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'statefulsets',
  });

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <StatefulSetsTable statefulsets={resources} />}
    </div>
  );
};
