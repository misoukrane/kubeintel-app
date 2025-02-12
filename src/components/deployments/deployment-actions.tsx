import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  RefreshCw,
  Scale,
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

// Update the schema to handle string input
const scaleFormSchema = z.object({
  replicas: z.string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number()
        .min(0, "Must be 0 or greater")
        .int("Must be a whole number")
    ),
});

// Update the type to match the form input
type ScaleFormValues = {
  replicas: string;
};

interface DeploymentActionsProps {
  deploymentName?: string;
  currentReplicas: number;
  onScale?: (currentReplicas: number, replicas: number) => Promise<void>;
  onDelete: () => Promise<void>;
  onRestart: () => Promise<void>;
  onLogs: (containerName?: string) => Promise<void>;
  onOpenEvents: () => Promise<void>;
}

export const DeploymentActions = ({
  deploymentName,
  currentReplicas,
  onScale,
  onDelete,
  onRestart,
  onLogs,
  onOpenEvents,
}: DeploymentActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [scaleDialogOpen, setScaleDialogOpen] = React.useState(false)

  // Update the form default values to use string
  const form = useForm<ScaleFormValues>({
    resolver: zodResolver(scaleFormSchema),
    defaultValues: {
      replicas: currentReplicas.toString(),
    },
  })

  const handleDelete = async () => {
    await onDelete()
    setDeleteDialogOpen(false)
  }

  // Update handleScale to parse the number
  const handleScale = async (values: ScaleFormValues) => {
    if (!onScale) {
      return
    }
    await onScale(currentReplicas, parseInt(values.replicas, 10));
    setScaleDialogOpen(false);
  }

  return (
    <div className="w-full pt-4 flex justify-center align-center">
      <Command className="rounded-lg border shadow-md md:max-w-[450px]">
        <CommandInput placeholder="Type an action..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>

          <CommandGroup heading="Common Actions">
            {onScale && (<CommandItem onSelect={() => setScaleDialogOpen(true)}>
              <Scale className="mr-2 h-4 w-4" />
              <span>Scale Deployment</span>
            </CommandItem>)}
            <CommandItem onSelect={onRestart}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Rolling Restart</span>
            </CommandItem>
            <CommandItem onSelect={() => { onLogs() }}>
              <FileTerminal className="mr-2 h-4 w-4" />
              <span>View Logs</span>
            </CommandItem>
            <CommandItem onSelect={() => onOpenEvents()}>
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
              <span>Delete Deployment</span>
              <AlertTriangle className="ml-auto h-4 w-4" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deployment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the deployment {deploymentName} and all its pods.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Deployment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scale Dialog */}
      {onScale && (
        <Dialog open={scaleDialogOpen} onOpenChange={(open) => { setScaleDialogOpen(open); if (!open) form.reset(); }} >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scale Deployment</DialogTitle>
              <DialogDescription>
                Adjust the number of replicas for deployment {deploymentName}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleScale)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="replicas"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormLabel>Number of Replicas</FormLabel>
                      <FormControl className="w-24">
                        <Input
                          placeholder="Enter number of replicas..."
                          type="number"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Current replicas: {currentReplicas}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScaleDialogOpen(false)
                      form.reset()
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Scale Deployment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}