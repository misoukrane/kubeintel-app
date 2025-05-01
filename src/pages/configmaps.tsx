import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ConfigMapsTable } from '@/components/configmaps/configmaps-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1ConfigMap } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const ConfigMaps = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: configmaps,
    isLoading,
    error,
  } = useListKubeResource<V1ConfigMap>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.ConfigMap,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <ConfigMapsTable
          configmaps={configmaps ?? []}
          initialFilters={initialFilters}
          navigateToConfigMap={(namespace: string, name: string) => {
            navigate(
              `${ROUTES.CONFIGMAPS}/${name}?namespace=${encodeURIComponent(namespace)}`
            );
          }}
          columnVisibility={{
            labels: false,
            namespace: currentNamespace === 'all' ? true : false,
          }}
        />
      )}
    </div>
  );
};
