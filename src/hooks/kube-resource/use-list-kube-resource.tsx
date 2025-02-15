import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { ListKubeResourceProps } from './types';

export const useListKubeResource = <T extends object>({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
}: ListKubeResourceProps) => {
  return useQuery({
    queryKey: ['resources', resourceType, kubeconfigPath, context, namespace],
    queryFn: async () => {
      if (!kubeconfigPath || !context) {
        throw new Error('Missing required parameters');
      }

      return invoke<T[]>(`list_resource`, {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
      });
    },
    enabled: Boolean(kubeconfigPath && context),
    retry: 1,
    retryDelay: 500,
  });
};
