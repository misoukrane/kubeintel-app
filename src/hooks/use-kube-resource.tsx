import { useGetKubeResource } from './use-get-kube-resource';
import { useDeleteKubeResource } from './use-delete-kube-resource';
import { useLogsKubeResource } from './use-logs-kube-resource';
import { useEventsKubeResource } from './use-events-kube-resource';
import { useRestartKubeResource } from './use-restart-kube-resource';
import { useScaleKubeResource } from './use-scale-kube-resource';

interface UseKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
  name?: string;
  onDeleteSuccess?: () => void;
}

export const useKubeResource = <T extends object>({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
  onDeleteSuccess,
}: UseKubeResourceProps) => {
  const {
    data: resource,
    isLoading,
    error,
  } = useGetKubeResource<T>({
    kubeconfigPath,
    context,
    namespace,
    resourceType,
    name,
  });

  const { mutate: deleteResource } = useDeleteKubeResource({
    kubeconfigPath,
    context,
    namespace,
    resource: resourceType,
    name,
    onSuccess: onDeleteSuccess,
  });

  const { mutate: openLogs } = useLogsKubeResource({
    kubeconfigPath,
    context,
    namespace,
    resource: resourceType,
    name,
  });

  const { mutate: openEvents } = useEventsKubeResource({
    kubeconfigPath,
    context,
    namespace,
    resource: resourceType,
    name,
  });

  const { mutate: restartResource } = useRestartKubeResource({
    kubeconfigPath,
    context,
    namespace,
    resourceType,
    name,
  });

  const { mutate: scaleResource } = useScaleKubeResource({
    kubeconfigPath,
    context,
    namespace,
    resourceType,
    name,
  });

  return {
    // Resource data and status
    resource,
    isLoading,
    error,

    // Resource operations
    deleteResource,
    openLogs,
    openEvents,
    restartResource,
    scaleResource,
  };
};
