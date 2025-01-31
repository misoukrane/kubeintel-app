import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodsTable } from '@/components/pods-table';
import { ErrorAlert } from '@/components/error-alert';
import { useListPods } from '@/hooks/use-list-pods';

export const Pods = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { pods, loading, error } = useListPods({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
  });

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <PodsTable pods={pods} />}
    </div>
  );
};
