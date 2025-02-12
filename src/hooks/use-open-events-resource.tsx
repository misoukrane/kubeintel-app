import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UseOpenEventsResourceProps {
  kubeconfigPath?: string;
  context?: string;
  namespace?: string;
  resource?: string;
  name?: string;
}

export const useOpenEventsResource = ({
  kubeconfigPath,
  context,
  namespace,
  resource,
  name,
}: UseOpenEventsResourceProps) => {
  const openEvents = useCallback(async () => {
    if (!kubeconfigPath || !context || !namespace || !resource || !name) {
      return;
    }
    try {
      await invoke(`open_resource_events_in_terminal`, {
        kubeconfigPath,
        context,
        namespace,
        resource,
        name,
      });
    } catch (error) {
      console.error('Failed to open pod events:', error);
    }
  }, [kubeconfigPath, context, namespace, name, resource]);

  return { openEvents };
};
