import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface OpenClusterInfoProps {
  kubeconfigPath?: string;
  context?: string;
}

export const useOpenClusterInfo = ({
  kubeconfigPath,
  context,
}: OpenClusterInfoProps) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context) {
        throw new Error(
          'Missing required parameters: kubeconfigPath or context'
        );
      }

      return invoke('open_cluster_info_on_terminal', {
        kubeconfigPath,
        context,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Cluster Info',
        description: 'Opening cluster information in terminal',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to open cluster info',
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};
