import { useGetKubeResource } from '@/hooks/kube-resource/use-get-kube-resource';
import { useDeleteKubeResource } from '@/hooks/kube-resource/use-delete-kube-resource';
import { useLogsKubeResource } from '@/hooks/kube-resource/use-logs-kube-resource';
import { useEventsKubeResource } from '@/hooks/kube-resource/use-events-kube-resource';
import { useRestartKubeResource } from '@/hooks/kube-resource/use-restart-kube-resource';
import { useScaleKubeResource } from '@/hooks/kube-resource/use-scale-kube-resource';
import { BaseKubeResourceProps } from '../../lib/types';

interface UseKubeResourceProps extends BaseKubeResourceProps {
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
    resourceType,
    name,
    onSuccess: onDeleteSuccess,
  });

  const { mutate: openLogs } = useLogsKubeResource({
    kubeconfigPath,
    context,
    namespace,
    resourceType,
    name,
  });

  const { mutate: openEvents } = useEventsKubeResource({
    kubeconfigPath,
    context,
    namespace,
    resourceType,
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
