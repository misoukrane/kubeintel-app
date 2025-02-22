import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodView } from '@/components/pods/pod-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useNavigate, useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useOpenPodShell } from '@/hooks/pods/use-open-pod-shell';
import { useDebugPod } from '@/hooks/pods/use-debug-pod';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ROUTES } from '@/lib/routes';
import { ResourceTypes } from '@/lib/strings';
import { createResourceEventsLoader } from '@/lib/pods';

export const Pod = () => {
  const { podName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    resource: pod,
    isLoading,
    error,
    deleteResource,
    openLogs,
    openEvents,
  } = useKubeResource<V1Pod>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.POD,
    name: podName,
    onDeleteSuccess: () => navigate(ROUTES.PODS),
  });

  const { openShell } = useOpenPodShell({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    podName: podName,
  });

  const { debugPod } = useDebugPod({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    podName: podName,
  });

  const listResourceEvents = createResourceEventsLoader({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.POD,
    name: podName,
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <>
          <PodView
            pod={pod}
            onCopy={copyToClipboard}
            onOpenShell={openShell}
            onOpenLogs={(containerName?: string) => openLogs(containerName)}
            onDebug={debugPod}
            onDelete={() => deleteResource()}
            onOpenEvents={() => openEvents()}
            onAddNewAIConfig={() => {
              navigate(ROUTES.AI_CONFIG_ADD_NEW);
            }}
            listResourceEvents={listResourceEvents}
          />
        </>
      )}
    </div>
  );
};
