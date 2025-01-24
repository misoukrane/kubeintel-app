import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/stores/use-config-store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { invoke } from '@tauri-apps/api/core';


export const Cluster = () => {
  const cfgState = useConfigStore();
  const [content, setContent] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const readConfig = async () => {
      // use tauri to read the kubeconfig file
      const filePath = cfgState.selectedKubeconfig
      if (!filePath || filePath.length === 0) {
        navigate('/');
        return;
      }
      try {
        // tauri invoke command read_kubeconfig
        const content = await invoke<string>('read_kubeconfig', { filepath: filePath });
        setContent(content);
      } catch (error) {
        console.error('Error reading file:', error);
        setContent(`Error reading kubeconfig file: ${error}`);
      }
    };
    readConfig();
  }, []);

  return (
    <div>
      <h1>Cluster</h1>
      <h2>{cfgState.selectedKubeconfig}</h2>
      <Button onClick={() => navigate('/')}>config</Button>
      <pre>{content}</pre>
    </div>
  )
};