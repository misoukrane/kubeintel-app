import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { BaseKubeResourceProps } from './types';

export const useGetKubeResource = <T extends object>({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: BaseKubeResourceProps) => {
  return useQuery({
    queryKey: [
      'resource',
      resourceType,
      kubeconfigPath,
      context,
      namespace,
      name,
    ],
    queryFn: async () => {
      if (!kubeconfigPath || !context || !name) {
        throw new Error('Missing required parameters');
      }

      const result = await invoke<T>('get_resource', {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
        name,
      });

      return result;
    },
    enabled: Boolean(kubeconfigPath && context && name),
    retry: 1,
    retryDelay: 500,
  });
};
