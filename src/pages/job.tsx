import { useConfigStore } from '@/stores/use-config-store';
import { Spinner } from '@/components/spinner';
import { JobView } from '@/components/jobs/job-view';
import { ErrorAlert } from '@/components/error-alert';
import { V1Job } from '@kubernetes/client-node';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useClipboard } from '@/hooks/use-clipboard';
import { useKubeResource } from '@/hooks/kube-resource/use-kube-resource';
import { ResourceTypes } from '@/lib/strings';
import { useState, useRef } from 'react';

export const Job = () => {
  const { jobName } = useParams();
  const [searchParams] = useSearchParams();
  const jobNamespace = searchParams.get('namespace');

  const navigate = useNavigate();
  const { copyToClipboard } = useClipboard();
  const { selectedKubeconfig, currentContext, currentNamespace } =
    useConfigStore();

  // Store the namespace from when the component first mounted
  // But prioritize the namespace from URL if it exists
  const initialNamespaceRef = useRef(
    jobNamespace ||
      (currentNamespace && currentNamespace !== 'all' ? currentNamespace : '')
  );

  // Local namespace state used for API calls
  const [resourceNamespace] = useState<string>(initialNamespaceRef.current);

  const { resource, isLoading, error, deleteResource, openLogs, openEvents } =
    useKubeResource<V1Job>({
      kubeconfigPath: selectedKubeconfig,
      context: currentContext,
      namespace: resourceNamespace,
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
