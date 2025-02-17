import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';
import { BaseKubeResourceProps } from './types';

export const useEventsKubeResource = ({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: BaseKubeResourceProps) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context || !name) {
        throw new Error('Missing required parameters');
      }

      return invoke('open_resource_events_in_terminal', {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
        name,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Events opened',
        description: `Opening events for ${resourceType} ${name}`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: `Failed to open ${resourceType} events`,
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};
