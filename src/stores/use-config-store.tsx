import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import superjson from 'superjson';
import { invoke } from '@tauri-apps/api/core';

interface Kubeconfig {
  contexts: { name: string }[];
  'current-context'?: string;
}

interface ConfigState {
  kubeconfigs: string[];
  selectedKubeconfig?: string;
  currentContext?: string;
  contexts: string[];
  error: Error | null;
  addKubeconfig: (filePath: string) => void;
  removeKubeconfig: (filePath: string) => void;
  setSelectedKubeconfig: (filePath: string) => void;
  setCurrentContext: (context: string) => void;
  loadKubeconfig: (path: string) => Promise<void>;
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
          currentContext: undefined, // Reset context when changing kubeconfig
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
          const contexts = config.contexts.map(
            (ctx: { name: any }) => ctx.name
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
    }),
    {
      name: 'kubeconfig-storage',
      storage,
    }
  )
);
