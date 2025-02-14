import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { StatefulSetView } from '@/components/statefulsets/statefulset-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1StatefulSet } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const StatefulSet = () => {
  const { statefulSetName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    resource,
    isLoading,
    error,
    deleteResource,
    openLogs,
    openEvents,
    restartResource,
    scaleResource,
  } = useKubeResource<V1StatefulSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.StatefulSet,
    name: statefulSetName,
    onDeleteSuccess: () => navigate('/statefulsets'),
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <StatefulSetView
          statefulSet={resource}
          onCopy={copyToClipboard}
          onScale={(params) => scaleResource(params)}
          onDelete={deleteResource}
          onRestart={restartResource}
          onLogs={(containerName?: string) => openLogs(containerName)}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
