'use client';

import * as React from 'react';
import {
  Check,
  ChevronsUpDown,
  Layers,
  ListRestart,
  Plus,
  X,
} from 'lucide-react'; // Import X icon
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
  const [userNamespaces, setUserNamespaces] = React.useState<string[]>([]);
  const [searchValue, setSearchValue] = React.useState('');
  const { isMobile, open: isExpanded } = useSidebar();
  const initialNamespacesEmpty = React.useMemo(
    () => namespaces.length === 0,
    [namespaces]
  );

  // Effect to potentially add currentNamespace to userNamespaces if it's not in the main list
  React.useEffect(() => {
    if (
      currentNamespace &&
      currentNamespace !== 'all' &&
      !namespaces.includes(currentNamespace)
    ) {
      // Use functional update to ensure we have the latest state when checking includes
      setUserNamespaces((prev) => {
        if (!prev.includes(currentNamespace)) {
          return [...prev, currentNamespace];
        }
        return prev; // Return previous state if already included
      });
    }
  }, [currentNamespace, namespaces]); // Depend only on the source props for this initialization logic

  // Effect to handle setting the default selected namespace
  React.useEffect(() => {
    // If no namespace is currently selected, try setting a default
    if (!currentNamespace) {
      if (namespaces.length > 0) {
        onNamespaceChange(namespaces[0]); // Default to first available namespace
      } else if (userNamespaces.length > 0) {
        onNamespaceChange(userNamespaces[0]); // Default to first user-added namespace
      }
    }
    // This effect depends on the current selection and the available/user lists
  }, [currentNamespace, namespaces, userNamespaces, onNamespaceChange]);

  const handleAddNamespace = () => {
    if (
      searchValue &&
      !userNamespaces.includes(searchValue) &&
      !namespaces.includes(searchValue)
    ) {
      const newUserNamespaces = [...userNamespaces, searchValue];
      setUserNamespaces(newUserNamespaces);
      onNamespaceChange(searchValue); // Select the newly added namespace
      setSearchValue(''); // Clear search input
      setOpen(false);
    }
  };

  const handleDeleteNamespace = (namespaceToDelete: string) => {
    setUserNamespaces((prev) => prev.filter((ns) => ns !== namespaceToDelete));
    // If the deleted namespace was the current one, select a new default
    if (currentNamespace === namespaceToDelete) {
      if (namespaces.length > 0) {
        onNamespaceChange(namespaces[0]);
      } else {
        const remainingUserNamespaces = userNamespaces.filter(
          (ns) => ns !== namespaceToDelete
        );
        if (remainingUserNamespaces.length > 0) {
          onNamespaceChange(remainingUserNamespaces[0]);
        } else {
          // Handle case where no namespaces are left - maybe clear selection or set a placeholder state
          // For now, let's just call onNamespaceChange with an empty string or a specific indicator if needed
          onNamespaceChange(''); // Or handle as appropriate for your app's logic
        }
      }
    }
  };

  const displayedNamespace =
    currentNamespace === 'all'
      ? 'All Namespaces'
      : currentNamespace ||
        (namespaces && namespaces.length > 0
          ? namespaces[0]
          : userNamespaces.length > 0
            ? userNamespaces[0]
            : 'Select namespace...');

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
                  {displayedNamespace}
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
              <CommandInput
                placeholder="Search or add namespace..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>
                  {initialNamespacesEmpty && searchValue ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleAddNamespace}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add "{searchValue}"
                    </Button>
                  ) : (
                    'No namespace found.'
                  )}
                </CommandEmpty>
                {!initialNamespacesEmpty && (
                  <>
                    <CommandGroup heading="Options">
                      <CommandItem
                        value="all"
                        onSelect={() => {
                          onNamespaceChange('all');
                          setOpen(false);
                        }}
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        All Namespaces
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            currentNamespace === 'all'
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                )}
                {namespaces.length > 0 && (
                  <CommandGroup heading="Available Namespaces">
                    {namespaces.map((namespace) => (
                      <CommandItem
                        key={namespace}
                        value={namespace}
                        onSelect={(ns) => {
                          onNamespaceChange(ns);
                          setOpen(false);
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
                )}
                {namespaces.length === 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Added Namespaces">
                      {userNamespaces.map((namespace) => (
                        <CommandItem
                          key={namespace}
                          value={namespace}
                          onSelect={(ns) => {
                            // Prevent selection if delete button is clicked
                            if (ns === namespace) {
                              onNamespaceChange(ns);
                              setOpen(false);
                            }
                          }}
                          className="flex justify-between items-center" // Use flex for layout
                        >
                          <span className="flex-grow">{namespace}</span>{' '}
                          {/* Namespace text */}
                          <div className="flex items-center">
                            {' '}
                            {/* Container for check and delete */}
                            <Check
                              className={cn(
                                'h-4 w-4 mr-2', // Add margin to separate from delete button
                                currentNamespace === namespace
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto text-muted-foreground hover:text-destructive" // Minimal styling
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent CommandItem onSelect
                                handleDeleteNamespace(namespace);
                              }}
                              aria-label={`Delete namespace ${namespace}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
                {!initialNamespacesEmpty && (
                  <>
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
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
