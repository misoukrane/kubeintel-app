import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { SecretView } from '@/components/secrets/secret-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Secret } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const Secret = () => {
  const { secretName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1Secret>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: currentNamespace,
      resourceType: ResourceTypes.Secret,
      name: secretName,
      onDeleteSuccess: () => navigate(ROUTES.SECRETS),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <SecretView
          secret={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
