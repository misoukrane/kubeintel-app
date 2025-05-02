import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { ClusterRoleBindingView } from '@/components/roles/cluster-role-binding-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1ClusterRoleBinding } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const ClusterRoleBinding = () => {
  const { clusterRoleBindingName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext } = useConfigStore();

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1ClusterRoleBinding>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: '', // ClusterRoleBindings are cluster-scoped
      resourceType: ResourceTypes.ClusterRoleBinding,
      name: clusterRoleBindingName,
      onDeleteSuccess: () => navigate(ROUTES.CLUSTER_ROLE_BINDINGS),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <ClusterRoleBindingView
          clusterRoleBinding={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
