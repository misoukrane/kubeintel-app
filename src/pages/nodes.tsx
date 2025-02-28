import { useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { NodesTable } from '@/components/nodes/nodes-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Node } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const Nodes = () => {
  const [searchParams] = useSearchParams();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const {
    data: resources,
    isLoading,
    error,
  } = useListKubeResource<V1Node>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: '', // Nodes are cluster-scoped
    resourceType: ResourceTypes.Node,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <NodesTable nodes={resources ?? []} initialFilters={initialFilters} />
      )}
    </div>
  );
};
