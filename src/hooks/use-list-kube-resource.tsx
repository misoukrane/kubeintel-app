import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

interface ListKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
}

export const useListKubeResource = <T extends object>({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
}: ListKubeResourceProps) => {
  return useQuery({
    queryKey: ['resources', resourceType, kubeconfigPath, context, namespace],
    queryFn: async () => {
      if (!kubeconfigPath || !context || !namespace) {
        throw new Error('Missing required parameters');
      }

      return invoke<T[]>(`list_${resourceType}`, {
        kubeconfigPath,
        context,
        namespace,
      });
    },
    enabled: Boolean(kubeconfigPath && context && namespace),
    retry: 1, // Limits retries to 2 attempts
    retryDelay: 500, // Waits 1 second between retries
  });
};
