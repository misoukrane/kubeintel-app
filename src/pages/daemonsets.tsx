import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DaemonSetsTable } from '@/components/daemonsets/daemonsets-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1DaemonSet } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { useNavigate } from 'react-router';

export const DaemonSets = () => {
  const navigate = useNavigate();
  const {
    selectedKubeconfig,
    currentContext,
    currentNamespace,
    setCurrentNamespace,
  } = useConfigStore();

  const {
    data: daemonsets,
    isLoading,
    error,
  } = useListKubeResource<V1DaemonSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.DaemonSet,
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DaemonSetsTable
          daemonsets={daemonsets ?? []}
          columnVisibility={{
            namespace: currentNamespace === 'all' ? true : false,
          }}
          navigateToDaemonSet={(namespace: string, name: string) => {
            navigate(
              `/daemonsets/${name}?namespace=${encodeURIComponent(namespace)}`
            );
          }}
        />
      )}
    </div>
  );
};
