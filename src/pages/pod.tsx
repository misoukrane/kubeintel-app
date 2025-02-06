import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodView } from '@/components/pods/pod-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/use-get-kube-resource';
import { useLocation, useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useOpenPodShell } from '@/hooks/use-open-pod-shell';

export const Pod = () => {
  const { podName } = useParams();
  const location = useLocation();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, loading, error } = useGetKubeResource<V1Pod>({
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

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && (
        <>
          <PodView
            pod={resource}
            onCopy={copyToClipboard}
            onOpenShell={openShell}
          />
        </>
      )}
    </div>
  );
};
