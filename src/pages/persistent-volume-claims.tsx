import { useSearchParams, useParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PersistentVolumeClaimsTable } from '@/components/persistent-volume-claims/persistent-volume-claims-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export default function PersistentVolumeClaimsPage() {
  const { namespace } = useParams();
  const [searchParams] = useSearchParams();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const {
    data: resources,
    isLoading,
    error,
  } = useListKubeResource<V1PersistentVolumeClaim>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: namespace || '',
    resourceType: ResourceTypes.PersistentVolumeClaim,
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
        <PersistentVolumeClaimsTable
          namespace={namespace || ''}
          persistentVolumeClaims={resources ?? []}
          initialFilters={initialFilters}
        />
      )}
    </div>
  );
}
