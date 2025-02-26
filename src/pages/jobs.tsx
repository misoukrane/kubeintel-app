import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { JobsTable } from '@/components/jobs/jobs-table';
import { ErrorAlert } from '@/components/error-alert';
import { V1Job } from '@kubernetes/client-node';
import { useListKubeResource } from '@/hooks/kube-resource/use-list-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const Jobs = () => {
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

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <JobsTable jobs={jobs ?? []} />
      )}
    </div>
  );
};