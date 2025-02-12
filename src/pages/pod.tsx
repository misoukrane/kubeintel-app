import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodView } from '@/components/pods/pod-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/use-get-kube-resource';
import { useNavigate, useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useOpenPodShell } from '@/hooks/use-open-pod-shell';
import { useDeleteKubeResource } from '@/hooks/use-delete-kube-resource';
import { useDebugPod } from '@/hooks/use-debug-pod';
import { useOpenEventsResource } from '@/hooks/use-open-events-resource';
import { useLogsKubeResource } from '@/hooks/use-logs-kube-resource';
import { ROUTES } from '@/lib/routes';

export const Pod = () => {
  const { podName } = useParams();
  const navigate = useNavigate();
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

  const { mutate: openLogs } = useLogsKubeResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resource: 'pod',
    name: podName,
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
    resource: 'pod',
    name: podName,
  });

  const { mutate: deleteResource } = useDeleteKubeResource({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resource: 'pod',
    name: podName,
    onSuccess: () => {
      navigate(ROUTES.PODS);
    },
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
            onOpenLogs={async (containerName?: string) => {
              await openLogs(containerName);
            }}
            onDebug={debugPod}
            onDelete={async () => await deleteResource()}
            onOpenEvents={openEvents}
          />
        </>
      )}
    </div>
  );
};
