import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import superjson from 'superjson';
import { invoke } from '@tauri-apps/api/core';
import { V1Namespace } from '@kubernetes/client-node';

interface Kubeconfig {
  contexts: { name: string; context: { namespace?: string } }[]; // Ensure namespace is optional
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
  setCurrentContext: (context: string) => Promise<void>; // Make async
  setCurrentNamespace: (namespace: string) => void;
  loadKubeconfig: (path: string) => Promise<void>;
  loadNamespaces: (path?: string, context?: string) => Promise<void>;
}

const storage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const parsed = superjson.parse(str) as any;
    return parsed;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, superjson.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
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
          currentNamespace: undefined, // Also reset namespace
        })),
      setCurrentNamespace: (namespace) =>
        set(() => ({
          currentNamespace: namespace,
        })),
      setCurrentContext: async (context) => {
        const { selectedKubeconfig } = get(); // Get current selected kubeconfig path

        if (!selectedKubeconfig) {
          set({ currentContext: context, currentNamespace: undefined });
          return;
        }

        let newNamespace: string | undefined = undefined;
        try {
          // Read the kubeconfig again to find the namespace for the new context
          const config = await invoke<Kubeconfig>('read_kubeconfig', {
            kubeconfigPath: selectedKubeconfig,
          });

          // Find the namespace associated with the *new* context
          newNamespace = config.contexts.find((ctx) => ctx.name === context)
            ?.context.namespace;

          set({
            currentContext: context,
            currentNamespace: newNamespace, // Set namespace or undefined if not found
            error: null,
          });
        } catch (error) {
          console.error(
            'Error reading kubeconfig while setting context:',
            error
          );
          set({
            currentContext: context, // Still set the context
            currentNamespace: undefined, // Reset namespace on error
            error:
              error instanceof Error
                ? error
                : new Error('Failed to read kubeconfig while setting context'),
          });
        }
      },
      loadKubeconfig: async (path) => {
        if (!path) {
          set({
            contexts: [],
            currentContext: undefined,
            currentNamespace: undefined,
          }); // Reset namespace too
          return;
        }

        try {
          const config = await invoke<Kubeconfig>('read_kubeconfig', {
            kubeconfigPath: path,
          });
          const currentContextName = config['current-context'];
          const currentNamespace = config.contexts.find(
            (ctx) => ctx.name === currentContextName
          )?.context.namespace;

          const contexts = config.contexts.map(
            (ctx: { name: string }) => ctx.name
          );
          set({
            contexts: contexts,
            currentContext: currentContextName || contexts[0],
            currentNamespace: currentNamespace, // Set namespace based on current-context
            error: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error
                : new Error('Failed to load kubeconfig'),
            contexts: [],
            currentContext: undefined,
            currentNamespace: undefined,
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
          const namespaces = await invoke<V1Namespace[]>('list_namespaces', {
            kubeconfigPath: path,
            context,
          });
          const nsList = namespaces.map((ns) => ns.metadata?.name as string);
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
