import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';
import { BaseKubeResourceProps } from '../../lib/types';

export const useRestartKubeResource = ({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: BaseKubeResourceProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context || !namespace || !name) {
        throw new Error('Missing required parameters');
      }

      return invoke(`restart_resource`, {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
        name,
      });
    },
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: [
          'resources',
          resourceType,
          kubeconfigPath,
          context,
          namespace,
        ],
      });
      // Invalidate single resource query
      queryClient.invalidateQueries({
        queryKey: [
          'resource',
          resourceType,
          kubeconfigPath,
          context,
          namespace,
          name,
        ],
      });

      toast({
        title: 'Success',
        description: `${resourceType} ${name} was restarted successfully`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: `Failed to restart ${resourceType}`,
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });
};
