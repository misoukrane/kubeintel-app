import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ClusterRolesTable } from '@/components/roles/cluster-roles-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1ClusterRole } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const ClusterRoles = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const {
    data: clusterRoles,
    isLoading,
    error,
  } = useListKubeResource<V1ClusterRole>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: '', // ClusterRoles are cluster-scoped, so no namespace is needed
    resourceType: ResourceTypes.ClusterRole,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  const handleNavigateToClusterRole = (name: string) => {
    navigate(
      ROUTES.CLUSTER_ROLE.replace(':clusterRoleName', encodeURIComponent(name))
    );
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <ClusterRolesTable
          clusterRoles={clusterRoles ?? []}
          initialFilters={initialFilters}
          navigateToClusterRole={handleNavigateToClusterRole}
        />
      )}
    </div>
  );
};
