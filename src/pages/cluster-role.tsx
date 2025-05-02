import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ClusterRoleView } from '@/components/roles/cluster-role-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1ClusterRole } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const ClusterRole = () => {
  const { clusterRoleName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1ClusterRole>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: '', // ClusterRoles are cluster-scoped
      resourceType: ResourceTypes.ClusterRole,
      name: clusterRoleName,
      onDeleteSuccess: () => navigate(ROUTES.CLUSTER_ROLES),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <ClusterRoleView
          clusterRole={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
