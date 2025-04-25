import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import { useConfigStore } from '@/stores/use-config-store';
import { Command } from '@tauri-apps/plugin-shell';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { invoke } from '@tauri-apps/api/core';

// authenticate the cluster
export const Auth = () => {
  const navigate = useNavigate();
  const { selectedKubeconfig, currentContext } = useConfigStore();
  const [cmdOutput, setCmdOutput] = useState<Array<string>>([]);
  const [code, setCode] = useState<number>(-1);
  const [executing, setExecuting] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAuthenticatedDialog, setOpenAuthenticatedDialog] =
    useState<boolean>(false);
  const [openMissingKubectlDialog, setOpenMissingKubectlDialog] =
    useState<boolean>(false);
  const kubeconfig = selectedKubeconfig ?? '';
  const context = currentContext ?? '';
  const cmdArgs = [
    'cluster-info',
    `--kubeconfig=${kubeconfig}`,
    `--context=${context}`,
  ];
  const hasRun = useRef(false);

  const runCommand = async () => {
    setExecuting(true);
    setCmdOutput([]);
    setError(null);
    setCode(-1);
    const command = Command.create('kubectl', cmdArgs);
    command.on('close', (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
      setExecuting(false);
      if (data.code !== 0) {
        setError(`Command failed with code ${data.code}`);
      }

      setCode(data.code == null ? -1 : data.code);
    });
    command.on('error', (error) => {
      console.error(`command error: "${error}"`);
      setExecuting(false);
      setError(error);
    });
    command.stdout.on('data', (line) =>
      setCmdOutput((prev) => [...prev, line])
    );
    command.stderr.on('data', (line) => {
      setCmdOutput((prev) => [...prev, line]);
    });
    await command.spawn();
  };

  useEffect(() => {
    if (kubeconfig && context && !hasRun.current) {
      hasRun.current = true;
      console.log('Running command:', cmdArgs);
      runCommand();
    }
  }, [kubeconfig, context]);

  useEffect(() => {
    if (code === 0 && !executing && error == null) {
      setOpenAuthenticatedDialog(true);
    }
  }, [code, executing, error]);


  useEffect(() => {
    (async () => {
      try {
        const status = await invoke<boolean>('is_kubectl_installed');
        if (!status) {
          setOpenMissingKubectlDialog(true);
        }
      } catch (error) {
        console.error('Error checking kubectl installation:', error);
        setOpenMissingKubectlDialog(true);
      }
    })();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-1">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error
              ? error
              : 'Failed to authenticate the cluster. Please check your kubeconfig file and try again.'}
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold pt-2">Authenticate Cluster</h1>
      </div>

      <div className="space-y-1">
        <p className="text-lg">
          Running the following command to authenticate the cluster:
        </p>
        <pre className="p-4 rounded-md text-sm text-gray-500">
          {`kubectl ${cmdArgs.join(' ')}`}
        </pre>
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Required</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            kubectl is required to be installed and configured on your system.
          </AlertDescription>
        </Alert>
      </div>
      <div className="space-y-1">
        <p className="text-lg">Output:</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <pre className="p-3 rounded-md text-xs text-prima ry overflow-x-auto">
            {/* Strip ANSI escape codes before joining and displaying */}
            {cmdOutput
              .map((line) => line.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, ''))
              .join('\n')}
          </pre>
        </div>
      </div>

      <div className="flex justify-center space-x-2 pt-4">
        <Button variant="secondary" onClick={runCommand}>
          Retry
        </Button>
        <Button variant="secondary" onClick={() => navigate(ROUTES.HOME)}>
          Back to config
        </Button>
      </div>
      <Dialog
        open={openAuthenticatedDialog}
        onOpenChange={setOpenAuthenticatedDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cluster Aurthenticated!</DialogTitle>
            <DialogDescription>
              Cluster Authenticated Successfully!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigate(ROUTES.HOME);
              }}
            >
              Back to Config
            </Button>
            <Button
              variant="default"
              onClick={() => {
                navigate(ROUTES.CLUSTER);
              }}
            >
              Go to Cluster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openMissingKubectlDialog}
        onOpenChange={setOpenMissingKubectlDialog}
      >
        <DialogContent className="sm:max-w-[425px] border-red-500 dark:border-red-600">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-500">Missing Kubectl</DialogTitle>
            <DialogDescription className="text-red-500/80 dark:text-red-400/80">
              Kubectl is not installed or not found in the system path. Please
              install kubectl and try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigate(ROUTES.HOME);
              }}
            >
              Back to Config
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
