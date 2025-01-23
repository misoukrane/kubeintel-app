import { create } from 'zustand'

interface ConfigState {
  kubeconfigs: Array<string>,
  addKubeconfig: (filePath: string) => void,
  removeKubeconfig: (filePath: string) => void,
  selectedKubeconfig?: string,
  setSelectedKubeconfig: (filePath: string) => void,
}
export const useConfigStore = create<ConfigState>()((set) => ({
  kubeconfigs: [],
  addKubeconfig: (filePath) => set((state) => ({ kubeconfigs: [...state.kubeconfigs, filePath] })),
  removeKubeconfig: (filePath) => set((state) => {
    const newKubeconfigs = state.kubeconfigs.filter((path) => path !== filePath);
    const newSelectedKubeconfig = state.selectedKubeconfig === filePath
      ? newKubeconfigs[0] || undefined
      : state.selectedKubeconfig;
    return { 
      kubeconfigs: newKubeconfigs,
      selectedKubeconfig: newSelectedKubeconfig
    };
  }),
  setSelectedKubeconfig: (filePath) => set(() => ({ selectedKubeconfig: filePath })),
}));