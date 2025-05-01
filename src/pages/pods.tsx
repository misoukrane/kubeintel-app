import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodsTable } from '@/components/pods/pods-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const Pods = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: resources,
    isLoading,
    error,
  } = useListKubeResource<V1Pod>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.Pod,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    status: searchParams.get('status') || '',
    node: searchParams.get('node') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <PodsTable
          navigateToPod={(namespace: string, name: string) => {
            navigate(
              `/pods/${name}?namespace=${encodeURIComponent(namespace)}`
            );
          }}
          pods={resources ?? []}
          initialFilters={initialFilters}
          columnVisibility={{
            labels: false,
            namespace: currentNamespace === 'all' ? true : false,
          }}
        />
      )}
    </div>
  );
};
