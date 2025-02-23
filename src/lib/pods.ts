import { invoke } from '@tauri-apps/api/core';
import { BaseKubeResourceProps, ListEventsResult } from './types';
import { CoreV1Event } from '@kubernetes/client-node';

export function createResourceEventsLoader({
  kubeconfigPath,
  context,
  namespace,
  resourceType,
  name,
}: BaseKubeResourceProps): () => Promise<ListEventsResult> {
  return async () => {
    try {
      const events = await invoke<CoreV1Event[]>('list_resource_events', {
        kubeconfigPath,
        context,
        namespace,
        resourceType,
        name,
      });

      return { data: events };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('Error fetching events:', err);
      return { error: errorMessage };
    }
  };
}

export interface PodLogsResult {
  data?: string;
  error?: string;
}

export function createPodLogsLoader({
  kubeconfigPath,
  context,
  namespace,
  name,
}: BaseKubeResourceProps): (
  containerName: string,
  tailLines?: number,
  limitBytes?: number
) => Promise<PodLogsResult> {
  return async (
    containerName: string,
    tailLines?: number,
    limitBytes?: number
  ) => {
    try {
      const logs = await invoke<string>('get_pod_logs', {
        kubeconfigPath,
        context,
        namespace,
        podName: name,
        containerName,
        tailLines,
        limitBytes,
      });

      return { data: logs };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch pod logs';
      console.error('Error fetching pod logs:', err);
      return { error: errorMessage };
    }
  };
}
