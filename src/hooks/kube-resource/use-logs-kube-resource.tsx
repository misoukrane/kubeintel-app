import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface LogsKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
  name?: string;
}

export const useLogsKubeResource = ({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: LogsKubeResourceProps) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (containerName?: string) => {
      if (!kubeconfigPath || !context || !namespace || !name) {
        throw new Error('Missing required parameters');
      }

      return invoke(`open_resource_logs_in_terminal`, {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
        name,
        containerName,
      });
    },
    onSuccess: (_, containerName) => {
      toast({
        title: 'Logs opened',
        description: `Opening logs for ${resourceType} ${name}${containerName ? ` (container: ${containerName})` : ''}`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: `Failed to open ${resourceType} logs`,
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};
