import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';
import { ToastSuccessClassName } from '@/lib/styles';

interface UseCordonNodeProps {
  kubeconfigPath?: string;
  context?: string;
  nodeName?: string;
}

export const useCordonNode = ({
  kubeconfigPath,
  context,
  nodeName,
}: UseCordonNodeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context || !nodeName) {
        throw new Error('Missing required parameters');
      }

      return invoke('cordon_node', {
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
        title: 'Node cordoned',
        className: ToastSuccessClassName,
        description: (
          <>
            Successfully cordoned node: <b>{nodeName}</b>
          </>
        ),
      });
    },
    onError: (error) => {
      console.error('Failed to cordon node:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to cordon node',
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};
