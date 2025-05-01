import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ConfigMapView } from '@/components/configmaps/configmap-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1ConfigMap } from '@kubernetes/client-node';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';
import { useState, useRef } from 'react';

export const ConfigMap = () => {
  const { configMapName } = useParams();
  const [searchParams] = useSearchParams();
  const configMapNamespace = searchParams.get('namespace');

  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  // Store the namespace from when the component first mounted
  // But prioritize the namespace from URL if it exists
  const initialNamespaceRef = useRef(
    configMapNamespace ||
      (currentNamespace && currentNamespace !== 'all' ? currentNamespace : '')
  );

  // Local namespace state used for API calls
  const [resourceNamespace] = useState<string>(initialNamespaceRef.current);

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1ConfigMap>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: resourceNamespace,
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
