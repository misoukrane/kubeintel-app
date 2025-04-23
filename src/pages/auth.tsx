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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

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
  const kubeconfig = selectedKubeconfig ?? '';
  const context = currentContext ?? '';
  const cmdArgs = [
    'cluster-info',
    `--kubeconfig=${kubeconfig}`,
    `--context=${context}`,
  ];

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
    if (kubeconfig && context) {
      runCommand();
    }
  }, []);

  useEffect(() => {
    if (code === 0 && !executing && error == null) {
      setOpenAuthenticatedDialog(true);
    }
  }, [code, executing, error]);

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
    </div>
  );
};
