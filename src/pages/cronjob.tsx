import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { CronJobView } from '@/components/cronjobs/cronjob-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1CronJob } from '@kubernetes/client-node';
import { useParams, useNavigate } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';

export const CronJob = () => {
  const { cronJobName } = useParams();
  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  const { resource, isLoading, error, deleteResource, openEvents } =
    useKubeResource<V1CronJob>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: currentNamespace,
      resourceType: ResourceTypes.CronJob,
      name: cronJobName,
      onDeleteSuccess: () => navigate('/cronjobs'),
    });

  return (
    <div className="space-y-4">
      {isLoading && <Spinner />}
      {error && <ErrorAlert error={error} />}
      {!isLoading && !error && (
        <CronJobView
          cronjob={resource}
          onCopy={copyToClipboard}
          onDelete={deleteResource}
          onOpenEvents={openEvents}
        />
      )}
    </div>
  );
};
