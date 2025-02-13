import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface DeleteKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
  name?: string;
  onSuccess?: () => void;
}

export const useDeleteKubeResource = ({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
  onSuccess,
}: DeleteKubeResourceProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context || !namespace || !name) {
        throw new Error('Missing required parameters');
      }

      return invoke(`delete_resource`, {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
        name,
      });
    },
    onSuccess: () => {
      // Invalidate queries to refetch the list
      queryClient.invalidateQueries({
        queryKey: ['resources', resourceType, kubeconfigPath, context, namespace],
      });

      toast({
        title: 'Success',
        description: `${resourceType} ${name} was deleted successfully`,
      });

      // Call onSuccess callback if provided
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: `Failed to delete ${resourceType}`,
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};
