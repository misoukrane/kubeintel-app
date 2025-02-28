import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { CronJobsTable } from '@/components/cronjobs/cronjobs-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1CronJob } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const CronJobs = () => {
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

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

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && <CronJobsTable cronjobs={cronjobs ?? []} />}
    </div>
  );
};
