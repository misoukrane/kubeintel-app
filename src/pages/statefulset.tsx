import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { StatefulSetView } from '@/components/statefulsets/statefulset-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1StatefulSet } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/kube-resource/use-get-kube-resource';
import { useParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';

export const StatefulSet = () => {
  const { statefulSetName } = useParams();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: resource,
    isLoading,
    error,
  } = useGetKubeResource<V1StatefulSet>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    name: statefulSetName,
    resourceType: 'statefulset',
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <StatefulSetView statefulSet={resource} onCopy={copyToClipboard} />
      )}
    </div>
  );
};
