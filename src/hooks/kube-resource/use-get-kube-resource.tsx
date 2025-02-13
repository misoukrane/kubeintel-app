import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

interface GetKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
  name?: string;
}

export const useGetKubeResource = <T extends object>({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: GetKubeResourceProps) => {
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
      if (!kubeconfigPath || !context || !namespace || !name) {
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
    enabled: Boolean(kubeconfigPath && context && namespace && name),
    retry: 1,
    retryDelay: 500,
  });
};
