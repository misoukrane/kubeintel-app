import * as React from "react";
import { Terminal, Logs } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";

const commonShells = ['/bin/sh', '/bin/bash', '/bin/zsh'];

interface ContainerCommandsProps {
  containerName: string;
  onOpenShell?: (containerName: string, shell: string) => Promise<void>;
  onOpenLogs?: (containerName?: string) => Promise<void>;
}

export const ContainerCommands = ({
  containerName,
  onOpenShell,
  onOpenLogs
}: ContainerCommandsProps) => {
  const [open, setOpen] = React.useState(false);
  const [customShell, setCustomShell] = React.useState("");

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
              <DropdownMenuItem onClick={() => {
                onOpenLogs(containerName);
                setOpen(false);
              }}>
                <Logs className="mr-2 h-4 w-4" />
                View Logs
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};