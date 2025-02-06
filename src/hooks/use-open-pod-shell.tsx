import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface UseOpenPodShellProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  podName?: string;
}

export const useOpenPodShell = ({
  kubeconfigPath,
  context,
  namespace,
  podName,
}: UseOpenPodShellProps) => {
  const { toast } = useToast();

  const openShell = async (
    containerName: string,
    shell: string = '/bin/sh'
  ) => {
    if (!kubeconfigPath || !context || !namespace) {
      return;
    }

    try {
      await invoke('open_pod_shell', {
        kubeconfigPath,
        context,
        namespace,
        podName,
        containerName,
        cmdShell: shell,
      });
      toast({
        title: 'Shell opened',
        description: (
          <>
            Opened shell in container: <b>{containerName}</b>
          </>
        ),
      });
    } catch (error) {
      console.error('Failed to open shell:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to open shell',
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  };

  return { openShell };
};
