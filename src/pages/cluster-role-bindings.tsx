import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ClusterRoleBindingsTable } from '@/components/roles/cluster-role-bindings-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1ClusterRoleBinding } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const ClusterRoleBindings = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const {
    data: clusterRoleBindings,
    isLoading,
    error,
  } = useListKubeResource<V1ClusterRoleBinding>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: '', // ClusterRoleBindings are cluster-scoped, so no namespace is needed
    resourceType: ResourceTypes.ClusterRoleBinding,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  const handleNavigateToClusterRoleBinding = (name: string) => {
    navigate(
      ROUTES.CLUSTER_ROLE_BINDING.replace(
        ':clusterRoleBindingName',
        encodeURIComponent(name)
      )
    );
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <ClusterRoleBindingsTable
          clusterRoleBindings={clusterRoleBindings ?? []}
          initialFilters={initialFilters}
          navigateToClusterRoleBinding={handleNavigateToClusterRoleBinding}
        />
      )}
    </div>
  );
};
