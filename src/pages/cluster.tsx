import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/stores/use-config-store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { invoke } from '@tauri-apps/api/core';
import * as k8s from '@kubernetes/client-node';


export const Cluster = () => {
  const cfgState = useConfigStore();
  const [content, setContent] = useState<string>('');
  const navigate = useNavigate();
  const kc = new k8s.KubeConfig();


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
        kc.loadFromString(content);
        kc.
      } catch (error) {
        console.error('Error reading file:', error);
        setContent(`Error reading kubeconfig file: ${error}`);
      }
    };
    readConfig();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cluster Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">{cfgState.selectedKubeconfig}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to config
        </Button>
      </div><div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
            {content}
          </pre>
        </div>
      </div>
    </>
  )
};