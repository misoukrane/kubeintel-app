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
import { ResourceTypes } from "@/lib/strings"

// Define the schema for form validation
const scaleFormSchema = z.object({
  replicas: z.string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z.number()
        .min(0, "Must be 0 or greater")
        .int("Must be a whole number")
    ),
});

// Define types based on the zod schema
//type ScaleFormSchemaType = z.infer<typeof scaleFormSchema>;
type ScaleFormValues = z.input<typeof scaleFormSchema>;

interface ResourceActionsProps {
  kind: ResourceTypes;
  resourceName?: string;
  currentReplicas?: number;
  canScale?: boolean;
  onScale?: (params: { currentReplicas: number; replicas: number }) => void;
  onDelete: () => void;
  onRestart?: () => void;
  onLogs?: (containerName?: string) => void;
  onOpenEvents?: () => void;
}

export const ResourceActions = ({
  kind,
  resourceName,
  currentReplicas = 0,
  canScale = true,
  onScale,
  onDelete,
  onRestart,
  onLogs,
  onOpenEvents,
}: ResourceActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [scaleDialogOpen, setScaleDialogOpen] = React.useState(false)

  // Check if resource supports restart
  const supportsRestart = kind !== 'Job' && kind !== 'CronJob';
  // Check if resource supports scaling
  const supportsScaling = kind !== 'Job' && kind !== 'CronJob' && canScale && !!onScale;

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

  const handleScale = async (values: ScaleFormValues) => {
    if (!onScale) return;
    // Parse the string to a number here
    const replicas = parseInt(values.replicas, 10);
    await onScale({ currentReplicas, replicas });
    setScaleDialogOpen(false);
  }

  return (
    <div className="w-full pt-4 flex justify-center align-center">
      <Command className="rounded-lg border shadow-md md:max-w-[450px]">
        <CommandInput placeholder="Type an action..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>

          <CommandGroup heading="Common Actions">
            {supportsScaling && (
              <CommandItem onSelect={() => setScaleDialogOpen(true)}>
                <Scale className="mr-2 h-4 w-4" />
                <span>Scale {kind}</span>
              </CommandItem>
            )}
            {supportsRestart && onRestart && (
              <CommandItem onSelect={onRestart}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Rolling Restart</span>
              </CommandItem>
            )}

            {onLogs && (<CommandItem onSelect={() => { onLogs() }}>
              <FileTerminal className="mr-2 h-4 w-4" />
              <span>View Logs</span>
            </CommandItem>
            )}
            {onOpenEvents && (<CommandItem onSelect={() => onOpenEvents()}>
              <FileTerminal className="mr-2 h-4 w-4" />
              <span>View Events</span>
            </CommandItem>)}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Dangerous Actions">
            <CommandItem
              onSelect={() => setDeleteDialogOpen(true)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete {kind}</span>
              <AlertTriangle className="ml-auto h-4 w-4" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {kind}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the {kind.toLowerCase()} {resourceName}
              {kind !== 'Job' && kind !== 'CronJob' ? ' and all its pods.' : '.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete {kind}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scale Dialog */}
      {supportsScaling && (
        <Dialog
          open={scaleDialogOpen}
          onOpenChange={(open) => {
            setScaleDialogOpen(open);
            if (!open) form.reset();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scale {kind}</DialogTitle>
              <DialogDescription>
                Adjust the number of replicas for {kind.toLowerCase()} {resourceName}
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
                    Scale {kind}
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