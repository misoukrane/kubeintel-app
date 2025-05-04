import { useParams, useNavigate } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ErrorAlert } from '@/components/error-alert';
import { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { PersistentVolumeClaimView } from '@/components/persistent-volume-claims/persistent-volume-claim-view';
import { useClipboard } from '@/hooks/use-clipboard';

export const PersistentVolumeClaimPage = () => {
  const { namespace, persistentVolumeClaimName } = useParams();
  const { selectedKubeconfig, currentContext } = useConfigStore();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();

  const {
    resource: persistentVolumeClaim,
    isLoading,
    error,
    deleteResource,
    openEvents,
  } = useKubeResource<V1PersistentVolumeClaim>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: namespace || '',
    resourceType: ResourceTypes.PersistentVolumeClaim,
    name: persistentVolumeClaimName,
    onDeleteSuccess: () => {
      if (namespace) {
        // Navigate back to the namespace's PVC list
        navigate(`/namespaces/${namespace}/persistent-volume-claims`);
      } else {
        // Navigate to the all-namespaces PVC list
        navigate('/persistent-volume-claims');
      }
    },
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <PersistentVolumeClaimView
          persistentVolumeClaim={persistentVolumeClaim}
          namespace={namespace || ''}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};

export default PersistentVolumeClaimPage;
