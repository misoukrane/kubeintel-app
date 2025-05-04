import { useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PersistentVolumesTable } from '@/components/persistent-volumes/persistent-volumes-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1PersistentVolume } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export default function PersistentVolumesPage() {
  const [searchParams] = useSearchParams();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const {
    data: resources,
    isLoading,
    error,
  } = useListKubeResource<V1PersistentVolume>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: '', // PersistentVolumes are cluster-scoped
    resourceType: ResourceTypes.PersistentVolume,
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
        <PersistentVolumesTable
          persistentVolumes={resources ?? []}
          initialFilters={initialFilters}
        />
      )}
    </div>
  );
}
