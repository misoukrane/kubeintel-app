import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UseClusterInfoProps {
  kubeconfigPath?: string;
  context?: string;
}

interface UseClusterInfoReturn {
  content: string;
  loading: boolean;
  error: string | null;
}

export const useClusterInfo = ({
  kubeconfigPath,
  context,
}: UseClusterInfoProps): UseClusterInfoReturn => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClusterInfo = async () => {
      if (!kubeconfigPath || !context) {
        setLoading(false);
        return;
      }

      try {
        const resp = await invoke<string>('cluster_info', {
          kubeconfigPath,
          context,
        });
        setContent(resp);
        setError(null);
      } catch (err) {
        setError(`Error reading kubeconfig file: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClusterInfo();
  }, [kubeconfigPath, context]);

  return { content, loading, error };
};
