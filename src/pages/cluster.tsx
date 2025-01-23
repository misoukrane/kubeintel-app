import { useConfigStore } from "@/stores/use-config-store";


export const Cluster = () => {
  const  cfgState = useConfigStore();
  return (
    <div>
      <h1>Cluster</h1>
      <h2>{cfgState.selectedKubeconfig}</h2>
    </div>
  )
};