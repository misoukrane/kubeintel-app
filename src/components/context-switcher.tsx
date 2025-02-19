'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface ContextSwitcherProps {
  contexts: string[];
  currentContext?: string;
  onContextChange: (context: string) => void;
  onKubeconfigChange: () => void;
}

export function ContextSwitcher({
  contexts,
  currentContext,
  onContextChange,
  onKubeconfigChange,
}: ContextSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const { isMobile, open: isExpanded } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="pl-2 w-full justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isExpanded && (
                <span className="truncate font-semibold">
                  {currentContext || 'Select a context'}
                </span>
              )}
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              'p-0',
              isExpanded
                ? 'w-[--radix-popover-trigger-width]'
                : 'w-[200px] -ml-2'
            )}
            align={isExpanded ? 'start' : 'center'}
            side={isMobile ? 'bottom' : 'right'}
            onOpenAutoFocus={(e) => {
              if (isMobile) {
                e.preventDefault();
              }
            }}
          >
            <Command>
              <CommandInput placeholder="Search context..." />
              <CommandList>
                <CommandEmpty>No context found.</CommandEmpty>
                <CommandGroup heading="Contexts">
                  {contexts.map((context) => (
                    <CommandItem
                      key={context}
                      value={context}
                      onSelect={(ctx) => {
                        onContextChange(ctx);
                        setOpen(false);
                      }}
                    >
                      {context}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          currentContext === context
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onKubeconfigChange();
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Change/Add kubeconfig
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
