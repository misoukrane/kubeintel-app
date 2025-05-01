import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ServiceAccountsTable } from '@/components/serviceaccounts/serviceaccounts-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1ServiceAccount } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const ServiceAccounts = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    selectedKubeconfig,
    currentContext,
    currentNamespace,
    setCurrentNamespace,
  } = useConfigStore();

  const {
    data: serviceAccounts,
    isLoading,
    error,
  } = useListKubeResource<V1ServiceAccount>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.ServiceAccount,
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
        <ServiceAccountsTable
          serviceAccounts={serviceAccounts ?? []}
          initialFilters={initialFilters}
          navigateToServiceAccount={(namespace: string, name: string) => {
            navigate(
              `${ROUTES.SERVICEACCOUNTS}/${name}?namespace=${encodeURIComponent(namespace)}`
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
