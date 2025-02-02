import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodsTable } from '@/components/pods-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/use-list-kube-resource';

export const Pods = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resources, loading, error } = useListKubeResource<V1Pod>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'pods',
  });

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <PodsTable pods={resources} />}
    </div>
  );
};
