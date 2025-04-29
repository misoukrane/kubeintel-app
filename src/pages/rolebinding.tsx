import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { RoleBindingView } from '@/components/rolebindings/rolebinding-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1RoleBinding } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const RoleBinding = () => {
  const { roleBindingName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1RoleBinding>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: currentNamespace,
      resourceType: ResourceTypes.RoleBinding,
      name: roleBindingName,
      onDeleteSuccess: () => navigate(ROUTES.ROLEBINDINGS),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <RoleBindingView
          roleBinding={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};

export default RoleBinding;
