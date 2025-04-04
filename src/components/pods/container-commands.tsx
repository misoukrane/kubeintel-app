import * as React from 'react';
import { Terminal, Logs } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical } from 'lucide-react';

const commonShells = ['/bin/sh', '/bin/bash', '/bin/zsh'];

interface ContainerCommandsProps {
  containerName: string;
  onOpenShell?: (containerName: string, shell: string) => void;
  onDebug?: (debugImage: string, target?: string) => void;
  onOpenLogs?: (containerName?: string) => void;
}

export const ContainerCommands = ({
  containerName,
  onOpenShell,
  onOpenLogs,
  onDebug,
}: ContainerCommandsProps) => {
  const [open, setOpen] = React.useState(false);
  const [customShell, setCustomShell] = React.useState('');
  const [customDebugImage, setCustomDebugImage] = React.useState('');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Container Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          {onOpenShell && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Terminal className="mr-2 h-4 w-4" />
                Open Shell
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-0">
                <Command>
                  <CommandInput
                    placeholder="Enter shell path..."
                    value={customShell}
                    onValueChange={setCustomShell}
                  />
                  <CommandList>
                    <CommandEmpty>No shell found.</CommandEmpty>
                    <CommandGroup heading="Common Shells">
                      {commonShells.map((shell) => (
                        <CommandItem
                          key={shell}
                          value={shell}
                          onSelect={() => {
                            onOpenShell(containerName, shell);
                            setOpen(false);
                          }}
                        >
                          {shell}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {customShell && (
                      <CommandGroup heading="Custom Shell">
                        <CommandItem
                          value={customShell}
                          onSelect={() => {
                            onOpenShell(containerName, customShell);
                            setOpen(false);
                          }}
                        >
                          Use: {customShell}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {onOpenLogs && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  onOpenLogs(containerName);
                  setOpen(false);
                }}
              >
                <Logs className="mr-2 h-4 w-4" />
                View Logs
              </DropdownMenuItem>
            </>
          )}
          {onDebug && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Terminal className="mr-2 h-4 w-4" />
                  Debug
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="p-0">
                  <Command>
                    <CommandInput
                      placeholder="Enter debug image..."
                      value={customDebugImage}
                      onValueChange={setCustomDebugImage}
                    />
                    <CommandList>
                      <CommandEmpty>No image found.</CommandEmpty>
                      <CommandGroup heading="Common Images">
                        {[
                          'docker.io/library/busybox:latest',
                          'docker.io/library/alpine:latest',
                          'docker.io/library/debian:latest',
                          'docker.io/library/ubuntu:latest',
                        ].map((image) => (
                          <CommandItem
                            key={image}
                            value={image}
                            onSelect={() => {
                              onDebug(image, containerName);
                              setOpen(false);
                            }}
                          >
                            {image}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {customDebugImage && (
                        <CommandGroup heading="Custom Image">
                          <CommandItem
                            value={customDebugImage}
                            onSelect={() => {
                              onDebug(customDebugImage, containerName);
                              setOpen(false);
                            }}
                          >
                            Use: {customDebugImage}
                          </CommandItem>
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
