import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { PodView } from '@/components/pod-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Pod } from '@kubernetes/client-node';
import { useGetKubeResource } from '@/hooks/use-get-kube-resource';
import { useParams } from 'react-router';

export const Pod = () => {
  let { podName } = useParams();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, loading, error } = useGetKubeResource<V1Pod>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    name: podName,
    resourceType: 'pod',
  });

  return (
    <div className="space-y-4">
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && <PodView pod={resource} />}
    </div>
  );
};
