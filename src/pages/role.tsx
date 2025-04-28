import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { RoleView } from '@/components/roles/role-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Role } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const Role = () => {
  const { roleName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1Role>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: currentNamespace,
      resourceType: ResourceTypes.Role,
      name: roleName,
      onDeleteSuccess: () => navigate(ROUTES.ROLES),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <RoleView
          role={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};

export default Role; 