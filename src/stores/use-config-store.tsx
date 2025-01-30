import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import superjson from 'superjson';
import { invoke } from '@tauri-apps/api/core';

interface Kubeconfig {
  contexts: { name: string; context: { namespace: string } }[];
  'current-context'?: string;
}

interface ConfigState {
  kubeconfigs: string[];
  selectedKubeconfig?: string;
  currentContext?: string;
  contexts: string[];
  currentNamespace?: string;
  namespaces: string[];
  error: Error | null;
  addKubeconfig: (filePath: string) => void;
  removeKubeconfig: (filePath: string) => void;
  setSelectedKubeconfig: (filePath: string) => void;
  setCurrentContext: (context: string) => void;
  setCurrentNamespace: (namespace: string) => void;
  loadKubeconfig: (path: string) => Promise<void>;
  loadNamespaces: (path?: string, context?: string) => Promise<void>;
}

const storage = {
  getItem: (name: string) => {
    console.log('getItem:', name);
    const str = localStorage.getItem(name);
    if (!str) return null;
    const parsed = superjson.parse(str) as any;
    console.log('getItem result:', parsed);
    return parsed;
  },
  setItem: (name: string, value: any) => {
    console.log('setItem:', name, value);
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: (name: string) => {
    console.log('removeItem:', name);
    localStorage.removeItem(name);
  },
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      kubeconfigs: [],
      selectedKubeconfig: undefined,
      currentContext: undefined,
      contexts: [],
      currentNamespace: undefined,
      namespaces: [],
      error: null,

      addKubeconfig: (filePath) =>
        set((state) => ({
          kubeconfigs: [...state.kubeconfigs, filePath],
        })),

      removeKubeconfig: (filePath) =>
        set((state) => {
          const newKubeconfigs = state.kubeconfigs.filter(
            (path) => path !== filePath
          );
          const newSelectedKubeconfig =
            state.selectedKubeconfig === filePath
              ? newKubeconfigs[0] || undefined
              : state.selectedKubeconfig;
          return {
            kubeconfigs: newKubeconfigs,
            selectedKubeconfig: newSelectedKubeconfig,
            currentContext:
              state.selectedKubeconfig === filePath
                ? undefined
                : state.currentContext,
          };
        }),

      setSelectedKubeconfig: (filePath) =>
        set(() => ({
          selectedKubeconfig: filePath,
          contexts: [],
          currentContext: undefined, // Reset context when changing kubeconfig
        })),
      setCurrentNamespace: (namespace) =>
        set(() => ({
          currentNamespace: namespace,
        })),
      setCurrentContext: (context) =>
        set(() => ({
          currentContext: context,
        })),
      loadKubeconfig: async (path) => {
        if (!path) {
          set({ contexts: [], currentContext: undefined });
          return;
        }

        try {
          const config = await invoke<Kubeconfig>('read_kubeconfig', {
            kubeconfigPath: path,
          });
          const currentNamespace = config.contexts.find(
            (ctx) => ctx.name === config['current-context']
          )?.context.namespace;
          console.log('from store', currentNamespace);
          console.log('from store contexts', config.contexts);
          if (currentNamespace) {
            set({ currentNamespace });
          }
          const contexts = config.contexts.map(
            (ctx: { name: string }) => ctx.name
          );
          set({
            contexts: contexts,
            currentContext: config['current-context'] || contexts[0],
            error: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error
                : new Error('Failed to load kubeconfig'),
            contexts: [],
          });
          throw error;
        }
      },
      loadNamespaces: async (path?: string, context?: string) => {
        if (!path || !context) {
          set({ namespaces: [], currentNamespace: undefined });
          return;
        }

        try {
          const namespaces = await invoke<any>('list_namespaces', {
            kubeconfigPath: path,
            context,
          });
          console.log(namespaces);
          const nsList = namespaces.map(
            (ns: { metadata: { name: any } }) => ns.metadata.name
          );
          set({
            namespaces: nsList,
            error: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error
                : new Error('Failed to load namespaces'),
            namespaces: [],
          });
          throw error;
        }
      },
    }),
    {
      name: 'kubeconfig-storage',
      storage,
    }
  )
);
