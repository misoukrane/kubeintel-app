import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface UseOpenPodLogsProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  podName?: string;
}

export const useOpenPodLogs = ({
  kubeconfigPath,
  context,
  namespace,
  podName,
}: UseOpenPodLogsProps) => {
  const { toast } = useToast();

  const openLogs = async (containerName?: string) => {
    if (!kubeconfigPath || !context || !namespace || !podName) {
      return;
    }

    try {
      await invoke('open_pod_logs', {
        kubeconfigPath,
        context,
        namespace,
        podName,
        containerName,
      });
      toast({
        title: 'Logs opened',
        description: (
          <>
            Opened logs for container: <b>{containerName}</b>
          </>
        ),
      });
    } catch (error) {
      console.error('Failed to open logs:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to open logs',
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  };

  return { openLogs };
};
