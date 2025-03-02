import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ConfigMapView } from '@/components/configmaps/configmap-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1ConfigMap } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const ConfigMap = () => {
  const { configMapName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1ConfigMap>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: currentNamespace,
      resourceType: ResourceTypes.ConfigMap,
      name: configMapName,
      onDeleteSuccess: () => navigate(ROUTES.CONFIGMAPS),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <ConfigMapView
          configMap={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
