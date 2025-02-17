import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface UseUncordonNodeProps {
  kubeconfigPath?: string;
  context?: string;
  nodeName?: string;
}

export const useUncordonNode = ({
  kubeconfigPath,
  context,
  nodeName,
}: UseUncordonNodeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context || !nodeName) {
        throw new Error('Missing required parameters');
      }

      return invoke('uncordon_node', {
        kubeconfigPath,
        context,
        nodeName,
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['node', kubeconfigPath, context, nodeName],
      });

      toast({
        title: 'Node uncordoned',
        description: (
          <>
            Successfully uncordoned node: <b>{nodeName}</b>
          </>
        ),
      });
    },
    onError: (error) => {
      console.error('Failed to uncordon node:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to uncordon node',
        description: error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};