import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { DeploymentsTable } from '@/components/deployments/deployments-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Deployment } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { useNavigate } from 'react-router';

export const Deployments = () => {
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: deployments,
    isLoading,
    error,
  } = useListKubeResource<V1Deployment>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.Deployment,
  });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <DeploymentsTable
          deployments={deployments ?? []}
          columnVisibility={{
            namespace: currentNamespace === 'all' ? true : false,
          }}
          navigateToDeployment={(namespace: string, name: string) => {
            navigate(
              `/deployments/${name}?namespace=${encodeURIComponent(namespace)}`
            );
          }}
        />
      )}
    </div>
  );
};
