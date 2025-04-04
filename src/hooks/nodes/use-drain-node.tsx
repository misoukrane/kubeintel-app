import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface UseDrainNodeProps {
  kubeconfigPath?: string;
  context?: string;
  nodeName?: string;
}

export const useDrainNode = ({
  kubeconfigPath,
  context,
  nodeName,
}: UseDrainNodeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context || !nodeName) {
        throw new Error('Missing required parameters');
      }

      return invoke('drain_node', {
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
        title: 'Node drained',
        description: (
          <>
            Successfully drained node: <b>{nodeName}</b>
          </>
        ),
      });
    },
    onError: (error) => {
      console.error('Failed to drain node:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to drain node',
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};
