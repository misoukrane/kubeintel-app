import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { JobView } from '@/components/jobs/job-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Job } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const Job = () => {
  const { jobName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, isLoading, error, deleteResource, openLogs, openEvents } =
    useKubeResource<V1Job>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: currentNamespace,
      resourceType: ResourceTypes.Job,
      name: jobName,
      onDeleteSuccess: () => navigate('/jobs'),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <JobView
          job={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onLogs={(containerName?: string) => openLogs(containerName)}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
