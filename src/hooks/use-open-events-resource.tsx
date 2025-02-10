import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UseOpenEventsResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resourceType?: string;
  name?: string;
}

export const useOpenEventsResource = ({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: UseOpenEventsResourceProps) => {
  const openEvents = useCallback(async () => {
    if (!kubeconfigPath || !context || !namespace || !resourceType || !name) {
      return;
    }
    try {
      await invoke(`open_${resourceType}_events`, {
        kubeconfigPath,
        context,
        namespace,
        name,
      });
    } catch (error) {
      console.error('Failed to open pod events:', error);
    }
  }, [kubeconfigPath, context, namespace, name, resourceType]);

  return { openEvents };
};
