import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DaemonSetsTable } from '@/components/daemonsets-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1DaemonSet } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/use-list-kube-resource';

export const DaemonSets = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: daemonsets,
    isLoading,
    error,
  } = useListKubeResource<V1DaemonSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'daemonsets',
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DaemonSetsTable daemonsets={daemonsets ?? []} />
      )}
    </div>
  );
};
