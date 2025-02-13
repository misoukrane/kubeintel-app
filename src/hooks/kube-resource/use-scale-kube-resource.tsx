import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface ScaleKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
  name?: string;
}

export const useScaleKubeResource = ({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: ScaleKubeResourceProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      currentReplicas,
      replicas,
    }: {
      currentReplicas: number;
      replicas: number;
    }) => {
      if (!kubeconfigPath || !context || !namespace || !name) {
        throw new Error('Missing required parameters');
      }

      return invoke(`scale_resource`, {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
        name,
        currentReplicas,
        replicas,
      });
    },
    onSuccess: (_, replicas) => {
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
        description: `${resourceType} ${name} was scaled to ${replicas} replicas`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: `Failed to scale ${resourceType}`,
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });
};
