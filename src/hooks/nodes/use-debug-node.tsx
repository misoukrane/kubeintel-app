import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface UseDebugNodeProps {
  kubeconfigPath?: string;
  context?: string;
  nodeName?: string;
}

export const useDebugNode = ({
  kubeconfigPath,
  context,
  nodeName,
}: UseDebugNodeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: string) => {
      if (!kubeconfigPath || !context || !nodeName) {
        throw new Error('Missing required parameters');
      }

      return invoke('debug_node', {
        kubeconfigPath,
        context,
        nodeName,
        image,
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['node', kubeconfigPath, context, nodeName],
      });

      toast({
        title: 'Debug node created',
        description: (
          <>
            Created debug container on node: <b>{nodeName}</b>
          </>
        ),
      });
    },
    onError: (error) => {
      console.error('Failed to create debug container:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create debug container',
        description: error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};