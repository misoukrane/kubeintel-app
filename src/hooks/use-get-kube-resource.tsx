import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface GetKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
  name?: string;
}

interface GetKubeResourceReturn<T> {
  resource: T | null;
  loading: boolean;
  error: string | null;
}

export const useGetKubeResource = <T extends object>({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: GetKubeResourceProps): GetKubeResourceReturn<T> => {
  const [resource, setResource] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      if (!kubeconfigPath || !context || !namespace) {
        setLoading(false);
        return;
      }

      if (!name) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      try {
        const resp = await invoke<T>(`get_${resourceType}`, {
          kubeconfigPath,
          context,
          namespace,
          name,
        });
        setResource(resp);
        setError(null);
      } catch (err) {
        console.error(`Error getting ${resourceType}:`, err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchResource();
  }, [kubeconfigPath, context, namespace, resourceType, name]);

  return { resource, loading, error };
};
