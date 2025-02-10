import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodView } from '@/components/pods/pod-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/use-get-kube-resource';
import { useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useOpenPodShell } from '@/hooks/use-open-pod-shell';
import { useOpenPodLogs } from '@/hooks/use-open-pod-logs';
import { useDeleteKubeResource } from '@/hooks/use-delete-kube-resource';
import { useDebugPod } from '@/hooks/use-debug-pod';
import { useOpenEventsResource } from '@/hooks/use-open-events-resource';

export const Pod = () => {
  const { podName } = useParams();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: resource,
    isLoading,
    error,
  } = useGetKubeResource<V1Pod>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    name: podName,
    resourceType: 'pod',
  });

  const { openShell } = useOpenPodShell({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    podName: podName,
  });

  const { openLogs } = useOpenPodLogs({
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

  const { openEvents } = useOpenEventsResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'pod',
    name: podName,
  });

  const { mutate: deleteResource } = useDeleteKubeResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: 'pod',
    name: podName,
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <>
          <PodView
            pod={resource}
            onCopy={copyToClipboard}
            onOpenShell={openShell}
            onOpenLogs={openLogs}
            onDebug={debugPod}
            onDelete={async () => await deleteResource()}
            onOpenEvents={openEvents}
          />
        </>
      )}
    </div>
  );
};
