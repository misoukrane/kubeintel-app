import { useParams, useNavigate } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ErrorAlert } from '@/components/error-alert';
import { V1PersistentVolume } from '@kubernetes/client-node';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { PersistentVolumeView } from '@/components/persistent-volumes/persistent-volume-view';
import { useClipboard } from '@/hooks/use-clipboard';
import { ROUTES } from '@/lib/routes';

export const PersistentVolumePage = () => {
  const { persistentVolumeName } = useParams();
  const { selectedKubeconfig, currentContext } = useConfigStore();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();

  const {
    resource: persistentVolume,
    isLoading,
    error,
    deleteResource,
    openEvents,
  } = useKubeResource<V1PersistentVolume>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: '', // PersistentVolumes are cluster-scoped
    resourceType: ResourceTypes.PersistentVolume,
    name: persistentVolumeName,
    onDeleteSuccess: () => navigate(ROUTES.PERSISTENT_VOLUMES),
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <PersistentVolumeView
          persistentVolume={persistentVolume}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};

export default PersistentVolumePage;
