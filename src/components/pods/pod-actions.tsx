import {
  Bug,
  Trash2,
  FileTerminal,
  AlertTriangle,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react";
import { Button } from "@/components/ui/button";

// a componnet to display actions that can be performed on a pod
// it needs to be based on a command component

interface PodActionsProps {
  podName: string;
  isRunning?: boolean;
  onDelete?: (podName: string) => Promise<void>;
  onDebug?: (podName: string) => Promise<void>;
  onLogs?: (containerName?: string) => Promise<void>;
}

export const PodActions = ({
  podName,
  onDelete,
  onDebug,
  onLogs,
}: PodActionsProps) => {

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(podName);
    }
    setDeleteDialogOpen(false);
  }
  return (
    <div className="w-full pt-4 flex justify-center align-center">
      <Command className="rounded-lg border shadow-md md:max-w-[450px]">
        <CommandInput placeholder="Type an action..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>
          <CommandGroup heading="Common Actions">
            {onLogs && (
              <CommandItem onSelect={() => {
                // when containerName is empty, it will show logs for all containers
                onLogs('')
              }}>
                <FileTerminal className="mr-2 h-4 w-4" />
                <span>View Logs (all containers)</span>
              </CommandItem>
            )}
            {onDebug && (
              <CommandItem onSelect={() => onDebug(podName)}>
                <Bug className="mr-2 h-4 w-4" />
                <span>Debug Pod</span>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Dangerous Actions">
            {onDelete && (
              <CommandItem
                onSelect={() => {
                  setDeleteDialogOpen(true);
                  onDelete(podName)
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Pod</span>
                <AlertTriangle className="ml-auto h-4 w-4" />
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pod?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the pod {podName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Pod
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};