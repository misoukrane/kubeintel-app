import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { SecretsTable } from '@/components/secrets/secrets-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Secret } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export const Secrets = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    selectedKubeconfig,
    currentContext,
    currentNamespace,
    setCurrentNamespace,
  } = useConfigStore();

  const {
    data: secrets,
    isLoading,
    error,
  } = useListKubeResource<V1Secret>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.Secret,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    type: searchParams.get('type') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Sensitive Information</AlertTitle>
        <AlertDescription>
          Secrets contain sensitive information. Secret values are always
          returned base64 encoded and are not displayed directly for security
          reasons.
        </AlertDescription>
      </Alert>

      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <SecretsTable
          secrets={secrets ?? []}
          initialFilters={initialFilters}
          navigateToSecret={(namespace: string, name: string) => {
            if (namespace !== currentNamespace) {
              setCurrentNamespace(namespace);
            }
            navigate(`${ROUTES.SECRETS}/${name}`);
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
