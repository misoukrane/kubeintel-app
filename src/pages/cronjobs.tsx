import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { CronJobsTable } from '@/components/cronjobs/cronjobs-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1CronJob } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { useNavigate, useSearchParams } from 'react-router';
import { ROUTES } from '@/lib/routes';

export const CronJobs = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    selectedKubeconfig,
    currentContext,
    currentNamespace,
    setCurrentNamespace,
  } = useConfigStore();

  const {
    data: cronjobs,
    isLoading,
    error,
  } = useListKubeResource<V1CronJob>({
    kubeconfigPath: selectedKubeconfig,
    context: currentContext,
    namespace: currentNamespace,
    resourceType: ResourceTypes.CronJob,
  });

  // Get filters from URL parameters
  const initialFilters = {
    name: searchParams.get('name') || '',
    labelSelector: searchParams.get('labelSelector') || '',
  };

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <CronJobsTable
          cronjobs={cronjobs ?? []}
          initialFilters={initialFilters}
          navigateToCronJob={(namespace: string, name: string) => {
            navigate(
              `${ROUTES.CRONJOBS}/${name}?namespace=${encodeURIComponent(namespace)}`
            );
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
