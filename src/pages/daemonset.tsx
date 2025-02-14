import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DaemonSetView } from '@/components/daemonsets/daemonset-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1DaemonSet } from '@kubernetes/client-node';
import { useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useNavigate } from 'react-router';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const DaemonSet = () => {
  const { daemonSetName } = useParams();
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
  } = useKubeResource<V1DaemonSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.DaemonSet,
    name: daemonSetName,
    onDeleteSuccess: () => navigate('/daemonsets'),
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DaemonSetView
          daemonSet={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onRestart={restartResource}
          onLogs={(containerName?: string) => openLogs(containerName)}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
