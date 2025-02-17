import { invoke } from '@tauri-apps/api/core';
import { useToast } from '@/hooks/use-toast';

interface UseDebugPodProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  podName?: string;
}

export const useDebugPod = ({
  kubeconfigPath,
  context,
  namespace,
  podName,
}: UseDebugPodProps) => {
  const { toast } = useToast();

  const debugPod = async (image: string, target?: string) => {
    if (!kubeconfigPath || !context || !namespace || !podName) {
      return;
    }

    try {
      await invoke('debug_pod', {
        kubeconfigPath,
        context,
        namespace,
        podName,
        image,
        target,
      });
      toast({
        title: 'Debug pod created',
        description: (
          <>
            Created debug pod for: <b>{podName}</b>
            {target && (
              <>
                {' '}
                (target: <b>{target}</b>)
              </>
            )}
          </>
        ),
      });
    } catch (error) {
      console.error('Failed to create debug pod:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create debug pod',
        description:
          error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  };

  return { debugPod };
};
