import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import superjson from 'superjson';

interface ConfigState {
  kubeconfigs: string[];
  selectedKubeconfig?: string;
  addKubeconfig: (filePath: string) => void;
  removeKubeconfig: (filePath: string) => void;
  setSelectedKubeconfig: (filePath: string) => void;
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
          };
        }),
      setSelectedKubeconfig: (filePath) =>
        set(() => ({
          selectedKubeconfig: filePath,
        })),
    }),
    {
      name: 'kubeconfig-storage',
      storage,
    }
  )
);
