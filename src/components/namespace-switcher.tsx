'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, ListRestart } from 'lucide-react';
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

interface NamespaceSwitcherProps {
  namespaces: string[];
  currentNamespace?: string;
  onNamespaceChange: (namespace: string) => void;
  onReloadNamespaces: () => void;
}

export function NamespaceSwitcher({
  namespaces,
  currentNamespace,
  onNamespaceChange,
  onReloadNamespaces,
}: NamespaceSwitcherProps) {
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
                  {currentNamespace || 'Select namespace...'}
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
              <CommandInput placeholder="Search namespace..." />
              <CommandList>
                <CommandEmpty>No namespace found.</CommandEmpty>
                <CommandGroup heading="Namespaces">
                  {namespaces.map((namespace) => (
                    <CommandItem
                      key={namespace}
                      value={namespace}
                      onSelect={() => {
                        onNamespaceChange(namespace);
                        setOpen(false);
                      }}
                      onClick={(e) => {
                        console.log('clicked....');
                      }}
                    >
                      {namespace}
                      <Check
                        className={cn(
                          'ml-auto h-4 w-4',
                          currentNamespace === namespace
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
                      onReloadNamespaces();
                      setOpen(false);
                    }}
                  >
                    <ListRestart className="mr-2 h-4 w-4" />
                    Reload Namespaces
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
