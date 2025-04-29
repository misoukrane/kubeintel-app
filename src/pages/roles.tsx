import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { RolesTable } from '@/components/roles/roles-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Role } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const Roles = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    selectedKubeconfig,
    currentContext,
    currentNamespace,
    setCurrentNamespace,
  } = useConfigStore();

  const {
    data: roles,
    isLoading,
    error,
  } = useListKubeResource<V1Role>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.Role,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  const handleNavigateToRole = (namespace: string, name: string) => {
    if (namespace !== currentNamespace) {
      setCurrentNamespace(namespace);
    }
    navigate(ROUTES.ROLE.replace(':roleName', encodeURIComponent(name)));
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <RolesTable
          roles={roles ?? []}
          initialFilters={initialFilters}
          navigateToRole={handleNavigateToRole}
          columnVisibility={{
            namespace: currentNamespace === 'all' ? true : false,
          }}
        />
      )}
    </div>
  );
};

export default Roles;
