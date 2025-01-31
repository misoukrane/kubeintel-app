import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { V1Pod } from '@kubernetes/client-node';

interface UseListPodsProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
}

interface UseListPodsReturn {
  pods: Array<V1Pod>;
  loading: boolean;
  error: string | null;
}

export const useListPods = ({
  kubeconfigPath,
  context,
  namespace,
}: UseListPodsProps): UseListPodsReturn => {
  const [pods, setPods] = useState<Array<V1Pod>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPods = async () => {
      if (!kubeconfigPath || !context || !namespace) {
        setLoading(false);
        return;
      }

      try {
        const resp = await invoke<Array<V1Pod>>('list_pods', {
          kubeconfigPath,
          context,
          namespace,
        });
        setPods(resp);
        setError(null);
      } catch (err) {
        console.error(`Error list pods: ${err}`);
        setError(`Error list pods: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPods();
  }, [kubeconfigPath, context, namespace]);

  return { pods, loading, error };
};
