import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodView } from '@/components/pods/pod-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useOpenPodShell } from '@/hooks/pods/use-open-pod-shell';
import { useDebugPod } from '@/hooks/pods/use-debug-pod';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ROUTES } from '@/lib/routes';
import { ResourceTypes } from '@/lib/strings';
import { createPodLogsLoader, createResourceEventsLoader } from '@/lib/pods';
import { useState, useEffect, useRef } from 'react';

export const Pod = () => {
  // Get any potential namespace from the URL params
  const { podName } = useParams();
  const [searchParams] = useSearchParams();
  const podNamespace = searchParams.get('namespace');

  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  // Store the namespace from when the component first mounted
  // But now prioritize the namespace from URL if it exists
  const initialNamespaceRef = useRef(
    podNamespace ||
      (currentNamespace && currentNamespace !== 'all' ? currentNamespace : '')
  );

  // Local namespace state used for API calls
  const [resourceNamespace, setResourceNamespace] = useState<string>(
    initialNamespaceRef.current
  );

  // Handle the case where we don't have a podName (shouldn't happen in practice)
  const safePodName = podName || '';

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
    namespace: resourceNamespace,
    resourceType: ResourceTypes.Pod,
    name: safePodName,
    onDeleteSuccess: () => navigate(ROUTES.PODS),
  });

  const { openShell } = useOpenPodShell({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: resourceNamespace,
    podName: safePodName,
  });

  const { debugPod } = useDebugPod({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: resourceNamespace,
    podName: safePodName,
  });

  // These hooks expect to get container name when called
  const getContainerLogs = createPodLogsLoader({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: resourceNamespace,
    resourceType: ResourceTypes.Pod,
    name: safePodName,
  });

  const listResourceEvents = createResourceEventsLoader({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: resourceNamespace,
    resourceType: ResourceTypes.Pod,
    name: safePodName,
  });

  // Once the pod is loaded, get its namespace if we don't have one yet
  useEffect(() => {
    if (pod?.metadata?.namespace && resourceNamespace === '') {
      setResourceNamespace(pod.metadata.namespace);
    }
  }, [pod, resourceNamespace]);

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <PodView
          pod={pod}
          onCopy={copyToClipboard}
          onDelete={() => deleteResource()}
          onOpenLogs={(containerName) => openLogs(containerName)}
          onOpenShell={openShell}
          onDebug={debugPod}
          onOpenEvents={() => openEvents()}
          onAddNewAIConfig={() => navigate(ROUTES.AI_CONFIG)}
          listResourceEvents={listResourceEvents}
          getContainerLogs={getContainerLogs}
        />
      )}
    </div>
  );
};
