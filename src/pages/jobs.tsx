import { useNavigate, useSearchParams } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { JobsTable } from '@/components/jobs/jobs-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Job } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { ROUTES } from '@/lib/routes';

export const Jobs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const {
    data: jobs,
    isLoading,
    error,
  } = useListKubeResource<V1Job>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.Job,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    status: searchParams.get('status') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <JobsTable
          jobs={jobs ?? []}
          initialFilters={initialFilters}
          navigateToJob={(namespace: string, name: string) => {
            navigate(
              `${ROUTES.JOBS}/${name}?namespace=${encodeURIComponent(namespace)}`
            );
          }}
          columnVisibility={{ labels: false, namespace: false }}
        />
      )}
    </div>
  );
};
