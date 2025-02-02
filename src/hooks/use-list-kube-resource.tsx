import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ListKubeResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType: string;
}

interface ListKubeResourceReturn<T> {
  resources: Array<T>;
  loading: boolean;
  error: string | null;
}

export const useListKubeResource = <T extends object>({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
}: ListKubeResourceProps): ListKubeResourceReturn<T> => {
  const [resources, setResources] = useState<Array<T>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      if (!kubeconfigPath || !context || !namespace) {
        setLoading(false);
        return;
      }

      try {
        const resp = await invoke<Array<T>>(`list_${resourceType}`, {
          kubeconfigPath,
          context,
          namespace,
        });
        setResources(resp);
        setError(null);
      } catch (err) {
        console.error(`Error listing ${resourceType}:`, err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchResources();
  }, [kubeconfigPath, context, namespace, resourceType]);

  return { resources, loading, error };
};
