import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { V1Pod } from '@kubernetes/client-node';

interface UseListNodePodsProps {
  kubeconfigPath?: string;
  context?: string;
  nodeName?: string;
}

export const useListNodePods = ({
  kubeconfigPath,
  context,
  nodeName,
}: UseListNodePodsProps) => {
  return useQuery({
    queryKey: ['node-pods', kubeconfigPath, context, nodeName],
    queryFn: async () => {
      if (!kubeconfigPath || !context || !nodeName) {
        throw new Error('Missing required parameters');
      }

      return invoke<V1Pod[]>('list_pods_on_node', {
        kubeconfigPath,
        context,
        nodeName,
      });
    },
    enabled: Boolean(kubeconfigPath && context && nodeName),
    retry: false,
  });
};