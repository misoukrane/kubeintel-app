import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DaemonSetView } from '@/components/daemonsets/daemonset-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1DaemonSet } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/kube-resource/use-get-kube-resource';
import { useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';

export const DaemonSet = () => {
  const { daemonSetName } = useParams();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: resource,
    isLoading,
    error,
  } = useGetKubeResource<V1DaemonSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    name: daemonSetName,
    resourceType: 'daemonset',
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DaemonSetView daemonSet={resource} onCopy={copyToClipboard} />
      )}
    </div>
  );
};
