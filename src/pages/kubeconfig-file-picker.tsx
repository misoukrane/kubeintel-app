import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { homeDir, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import {
  FolderOpen,
  ArrowRight,
  Trash2,
  Check,
  ChevronsUpDown,
  TriangleAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useConfigStore } from '@/stores/use-config-store';
import { loadContextAuthConfig, loadKubeconfig } from '@/lib/kubeconfig';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AuthInfo } from '@/lib/types';

// Define a type for the details we want to store for each kubeconfig
type KubeconfigDetails = {
  contexts: string[];
  currentContext?: string;
  authConfig?: AuthInfo;
  error: Error | null;
};

// Component for the Context Combobox
const ContextCombobox = ({
  contexts,
  currentContext,
  onContextChange,
}: {
  contexts: string[];
  currentContext?: string;
  configPath: string;
  onContextChange: (newContext: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentContext || '');

  useEffect(() => {
    setValue(currentContext || '');
  }, [currentContext]);

  const contextItems = contexts.map((ctx) => ({ value: ctx, label: ctx }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between text-xs h-8"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="truncate">
            {value
              ? contextItems.find((ctx) => ctx.value === value)?.label
              : 'Select context...'}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search context..." className="h-9" />
          <CommandList>
            <CommandEmpty>No context found.</CommandEmpty>
            <CommandGroup>
              {contextItems.map((ctx) => (
                <CommandItem
                  key={ctx.value}
                  value={ctx.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue);
                    setOpen(false);
                    onContextChange(currentValue);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      'mr-2 h-3 w-3',
                      value === ctx.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {ctx.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const KubeconfigFilePicker = () => {
  const [kubeconfigDetails, setKubeconfigDetails] = useState<
    Record<string, KubeconfigDetails>
  >({});
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorFile, setErrorFile] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cfgState = useConfigStore();
  const navigate = useNavigate();

  const openFileDialog = async () => {
    try {
      const homeDirectory = await homeDir();
      const kubePath = await join(homeDirectory, '.kube');
      const selected = await open({
        multiple: false,
        directory: false,
        defaultPath: kubePath,
      });

      if (typeof selected === 'string') {
        cfgState.addKubeconfig(selected);
      }
    } catch (error) {
      console.error('Error adding file:', error);
    }
  };

  const onContinue = async (
    selectedFile: string,
    selectedContext: string | undefined
  ) => {
    if (!selectedContext) {
      console.error('No context selected for', selectedFile);
      return;
    }
    await cfgState.setSelectedKubeconfig(selectedFile);
    await cfgState.setCurrentContext(selectedContext);
    if (kubeconfigDetails[selectedFile]?.authConfig?.exec?.interactiveMode) {
      console.log(
        'interactive mode: ',
        kubeconfigDetails[selectedFile].authConfig.exec?.interactiveMode
      );
      navigate('/auth');
      return;
    }
    navigate('/auth');
  };

  const handleContextChange = async (
    configPath: string,
    newContext: string
  ) => {
    if (newContext === '') {
      return;
    }
    try {
      setKubeconfigDetails((prev) => ({
        ...prev,
        [configPath]: {
          ...prev[configPath],
          currentContext: newContext,
        },
      }));
      const authConfig = await loadContextAuthConfig(configPath, newContext);
      console.log('interactive mode', authConfig?.exec?.interactiveMode);
      setKubeconfigDetails((prev) => ({
        ...prev,
        [configPath]: {
          ...prev[configPath],
          currentContext: newContext,
          authConfig: authConfig,
        },
      }));
    } catch (error) {
      setKubeconfigDetails((prev) => ({
        ...prev,
        [configPath]: {
          ...prev[configPath],
          currentContext: newContext,
          error: error instanceof Error ? error : new Error(String(error)),
        },
      }));
    }
  };

  useEffect(() => {
    const loadAllKubeconfigs = async () => {
      const details: Record<string, KubeconfigDetails> = {};
      const existingContexts = { ...kubeconfigDetails };

      const results = await Promise.all(
        cfgState.kubeconfigs.map(async (configPath) => {
          if (
            !existingContexts[configPath] ||
            existingContexts[configPath].error
          ) {
            const result = await loadKubeconfig(configPath);
            return { path: configPath, details: result };
          }
          return { path: configPath, details: existingContexts[configPath] };
        })
      );
      results.forEach((result) => {
        const currentContext =
          existingContexts[result.path]?.currentContext ??
          result.details.currentContext;
        details[result.path] = {
          ...result.details,
          currentContext: currentContext,
        };
      });
      setKubeconfigDetails(details);
    };

    if (cfgState.kubeconfigs.length > 0) {
      loadAllKubeconfigs();
    } else {
      setKubeconfigDetails({});
    }
  }, [cfgState.kubeconfigs]);

  return (
    <div className="flex flex-col h-screen justify-center items-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Choose your kubeconfig file</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={openFileDialog}
            variant="outline"
            className="w-full p-8 border-dashed border-2 hover:border-primary"
          >
            <FolderOpen className="mr-2 h-6 w-6" />
            Click to select a file
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center"></CardFooter>
      </Card>

      {cfgState.kubeconfigs.length > 0 && (
        <>
          <Card className="w-full max-w-5xl mx-auto mt-4">
            <CardHeader>
              <CardTitle>Saved Kubeconfig Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cfgState.kubeconfigs.map((config) => {
                  const details = kubeconfigDetails[config] || {
                    contexts: [],
                    currentContext: undefined,
                    error: null,
                  };
                  return (
                    <div
                      key={config}
                      className="flex items-center justify-between rounded-lg p-2 hover:bg-muted cursor-pointer"
                      onClick={async () => {
                        if (!details.error && details.currentContext) {
                          await onContinue(config, details.currentContext);
                        }
                      }}
                    >
                      <div className="flex-1 mr-2 overflow-hidden">
                        <span
                          className={cn(
                            'text-sm font-medium truncate block',
                            details.error && 'line-through text-red-500'
                          )}
                          title={config}
                        >
                          {config}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <ContextCombobox
                          contexts={details.contexts}
                          currentContext={details.currentContext}
                          configPath={config}
                          onContextChange={(newContext) =>
                            handleContextChange(config, newContext)
                          }
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            cfgState.removeKubeconfig(config);
                            setKubeconfigDetails((prev) => {
                              const newState = { ...prev };
                              delete newState[config];
                              return newState;
                            });
                          }}
                          title="Remove Kubeconfig"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {details.error != null && (
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setErrorMessage(details.error!.message);
                              setErrorFile(config);
                              setOpenErrorDialog(true);
                            }}
                            title="we have an error"
                          >
                            <TriangleAlert className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        {!details.error && (
                          <Button
                            size="icon"
                            disabled={
                              !!details.error || !details.currentContext
                            }
                            title="Connect to Cluster"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await onContinue(config, details.currentContext);
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Dialog
            defaultOpen={false}
            open={openErrorDialog}
            onOpenChange={setOpenErrorDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Error reading/parsing kubeconfig file</DialogTitle>
                <DialogDescription>
                  <h2 className="font-medium text-gray-500">
                    File: {errorFile}
                  </h2>
                  <br />
                  <span className="text-xs text-red-500 break-words whitespace-pre-wrap max-w-full overflow-x-auto">
                    {errorMessage}
                  </span>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
