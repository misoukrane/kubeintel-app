import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  MinusCircle,
  PlusCircle,
  Cloud,
  Bug,
  Trash2,
  FileTerminal,
  AlertTriangle,
} from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Define a Zod schema for our debug form fields
const debugFormSchema = z.object({
  debugImage: z.string().min(1, "Image is required"),
});

type DebugFormValues = z.infer<typeof debugFormSchema>;

interface NodesActionsProps {
  nodeName: string;
  onCordon: () => void;
  onUncordon: () => void;
  onDrain: () => void;
  onDebug: (image: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const NodesActions = ({
  nodeName,
  onCordon,
  onUncordon,
  onDrain,
  onDebug,
  onDelete,
  onOpenEvents,
}: NodesActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = React.useState(false);
  const [drainDialogOpen, setDrainDialogOpen] = React.useState(false);
  const [cordonDialogOpen, setCordonDialogOpen] = React.useState(false);
  const [uncordonDialogOpen, setUncordonDialogOpen] = React.useState(false);

  // Form setup for debug dialog
  const form = useForm<DebugFormValues>({
    resolver: zodResolver(debugFormSchema),
    defaultValues: {
      debugImage: "busybox",
    },
  });

  const handleDelete = async () => {
    await onDelete();
    setDeleteDialogOpen(false);
  };

  const handleDebug = async (values: DebugFormValues) => {
    await onDebug(values.debugImage);
    setDebugDialogOpen(false);
  };

  const handleDrain = async () => {
    await onDrain();
    setDrainDialogOpen(false);
  };

  const handleCordon = async () => {
    await onCordon();
    setCordonDialogOpen(false);
  };

  const handleUncordon = async () => {
    await onUncordon();
    setUncordonDialogOpen(false);
  };

  return (
    <div className="w-full pt-4 flex justify-center align-center">
      <Command className="rounded-lg border shadow-md md:max-w-[450px]">
        <CommandInput placeholder="Type an action..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>

          <CommandGroup heading="Node Management">
            <CommandItem onSelect={() => setCordonDialogOpen(true)}>
              <MinusCircle className="mr-2 h-4 w-4" />
              <span>Cordon Node</span>
            </CommandItem>
            <CommandItem onSelect={() => setUncordonDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Uncordon Node</span>
            </CommandItem>
            <CommandItem onSelect={() => setDrainDialogOpen(true)}>
              <Cloud className="mr-2 h-4 w-4" />
              <span>Drain Node</span>
            </CommandItem>
            <CommandItem onSelect={() => setDebugDialogOpen(true)}>
              <Bug className="mr-2 h-4 w-4" />
              <span>Debug Node</span>
            </CommandItem>
            <CommandItem onSelect={onOpenEvents}>
              <FileTerminal className="mr-2 h-4 w-4" />
              <span>View Events</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Dangerous Actions">
            <CommandItem
              onSelect={() => setDeleteDialogOpen(true)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Node</span>
              <AlertTriangle className="ml-auto h-4 w-4" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Node?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the node {nodeName} from the cluster.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debug Dialog */}
      <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debug Node</DialogTitle>
            <DialogDescription>Choose debugger image to inspect the node</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleDebug)} className="py-4">
              <FormField
                control={form.control}
                name="debugImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        id="debugImage"
                        placeholder="Debugger image..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify the container image to be used for debugging.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="my-4">
                <Button
                  variant="outline"
                  onClick={() => setDebugDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button variant="default" type="submit">
                  Debug Node
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Drain Dialog */}
      <Dialog open={drainDialogOpen} onOpenChange={setDrainDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Drain Node?</DialogTitle>
            <DialogDescription>
              This will safely evict all pods from node {nodeName} and mark it as unschedulable.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrainDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleDrain}>
              Drain Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cordon Dialog */}
      <Dialog open={cordonDialogOpen} onOpenChange={setCordonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cordon Node?</DialogTitle>
            <DialogDescription>
              This will mark node {nodeName} as unschedulable. New pods will not be scheduled on this node.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCordonDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleCordon}>
              Cordon Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Uncordon Dialog */}
      <Dialog open={uncordonDialogOpen} onOpenChange={setUncordonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uncordon Node?</DialogTitle>
            <DialogDescription>
              This will mark node {nodeName} as schedulable. New pods can be scheduled on this node.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUncordonDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleUncordon}>
              Uncordon Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};