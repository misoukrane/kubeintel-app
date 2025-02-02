import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { V1Deployment } from '@kubernetes/client-node';

interface UseListDeploymentsProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
}

interface UseListDeploymentsReturn {
  deployments: Array<V1Deployment>;
  loading: boolean;
  error: string | null;
}

export const useListDeployments = ({
  kubeconfigPath,
  context,
  namespace,
}: UseListDeploymentsProps): UseListDeploymentsReturn => {
  const [deployments, setDeployments] = useState<Array<V1Deployment>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      if (!kubeconfigPath || !context || !namespace) {
        setLoading(false);
        return;
      }

      try {
        const resp = await invoke<Array<V1Deployment>>('list_deployments', {
          kubeconfigPath,
          context,
          namespace,
        });
        setDeployments(resp);
        setError(null);
      } catch (err) {
        console.error(`Error listing deployments: ${err}`);
        setError(`Error listing deployments: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, [kubeconfigPath, context, namespace]);

  return { deployments, loading, error };
};
