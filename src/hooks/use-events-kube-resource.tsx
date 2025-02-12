import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface EventsKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resource: string;
  name?: string;
}

export const useEventsKubeResource = ({
  kubeconfigPath,
  context,
  namespace,
  resource,
  name,
}: EventsKubeResourceProps) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!kubeconfigPath || !context || !namespace || !name) {
        throw new Error('Missing required parameters');
      }

      return invoke('open_resource_events_in_terminal', {
        kubeconfigPath,
        context,
        namespace,
        resource,
        name,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Events opened',
        description: `Opening events for ${resource} ${name}`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: `Failed to open ${resource} events`,
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    },
  });
};
