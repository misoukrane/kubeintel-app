import { Button } from '@/components/ui/button';
import { useConfigStore } from '@/stores/use-config-store';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { invoke } from '@tauri-apps/api/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/spinner';

export const Cluster = () => {
  const cfgState = useConfigStore();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const readConfig = async () => {
      // use tauri to read the kubeconfig file
      const filePath = cfgState.selectedKubeconfig;
      if (!filePath || filePath.length === 0) {
        navigate('/');
        return;
      }
      try {
        // tauri invoke command read_kubeconfig
        const content = await invoke<any>('cluster_info', {
          kubeconfigPath: filePath,
        });
        setContent(content);
        setLoading(false);
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
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to config
        </Button>
      </div>
      <div className="my-4">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>Your active Kubernetes configuration.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Kubeconfig:</div>
                <div className="col-span-2 text-xs font-bold">{cfgState.selectedKubeconfig}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="font-medium">Context:</div>
                <div className="col-span-2 text-xs font-bold">{cfgState.currentContext}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {loading && <Spinner />}
      {!loading && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <pre className="text-sm bg-muted p-4 rounded-md overflow-auto">
              {content}
            </pre>
          </div>
        </div>
      )}
    </>
  );
};
