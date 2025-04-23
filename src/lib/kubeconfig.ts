import { invoke } from '@tauri-apps/api/core';
import { AuthInfo, Kubeconfig } from './types';

type loadKubeconfigReturnType = {
  contexts: string[];
  currentContext?: string;
  authConfig?: AuthInfo;
  error: Error | null;
};

export const loadKubeconfig = async (
  path: string
): Promise<loadKubeconfigReturnType> => {
  try {
    const config = await invoke<Kubeconfig>('read_kubeconfig', {
      kubeconfigPath: path,
    });
    const currentContextName =
      config['current-context'] || config.contexts[0]?.name;
    const contexts = config.contexts.map((ctx: { name: string }) => ctx.name);

    const authConfig = await invoke<AuthInfo>('cluster_config_auth', {
      kubeconfigPath: path,
      context: currentContextName,
    });

    return {
      contexts,
      currentContext: currentContextName,
      authConfig,
      error: null,
    };
  } catch (error) {
    return {
      contexts: [],
      currentContext: undefined,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};

export const loadContextAuthConfig = async (
  path: string,
  context: string
): Promise<AuthInfo> => {
  try {
    const authConfig = await invoke<AuthInfo>('cluster_config_auth', {
      kubeconfigPath: path,
      context,
    });
    return authConfig;
  } catch (error) {
    console.error('Error loading context auth config:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
