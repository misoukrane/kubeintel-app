import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

interface UseClusterInfoProps {
  kubeconfigPath?: string;
  context?: string;
}

export const useClusterInfo = ({
  kubeconfigPath,
  context,
}: UseClusterInfoProps) => {
  return useQuery({
    queryKey: ['cluster-info', kubeconfigPath, context],
    queryFn: async () => {
      if (!kubeconfigPath || !context) {
        throw new Error('Missing required parameters');
      }

      return invoke<string>('cluster_info', {
        kubeconfigPath,
        context,
      });
    },
    enabled: Boolean(kubeconfigPath && context),
    retry: 1,
    retryDelay: 500,
  });
};
