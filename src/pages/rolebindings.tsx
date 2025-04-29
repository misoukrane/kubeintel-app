import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { RoleBindingsTable } from '@/components/rolebindings/rolebindings-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1RoleBinding } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const RoleBindings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    selectedKubeconfig,
    currentContext,
    currentNamespace,
    setCurrentNamespace,
  } = useConfigStore();

  const {
    data: roleBindings,
    isLoading,
    error,
  } = useListKubeResource<V1RoleBinding>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.RoleBinding,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  const handleNavigateToRoleBinding = (namespace: string, name: string) => {
    if (namespace !== currentNamespace) {
      setCurrentNamespace(namespace);
    }
    navigate(
      ROUTES.ROLEBINDING.replace(':roleBindingName', encodeURIComponent(name))
    );
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <RoleBindingsTable
          roleBindings={roleBindings ?? []}
          initialFilters={initialFilters}
          navigateToRoleBinding={handleNavigateToRoleBinding}
          columnVisibility={{
            namespace: currentNamespace === 'all' ? true : false,
          }}
        />
      )}
    </div>
  );
};

export default RoleBindings;
