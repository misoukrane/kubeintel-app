import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/stores/use-config-store";
import { useNavigate } from "react-router";


export const Cluster = () => {
  const  cfgState = useConfigStore();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Cluster</h1>
      <h2>{cfgState.selectedKubeconfig}</h2>
      <Button onClick={() => navigate('/')}>config</Button>
    </div>
  )
};