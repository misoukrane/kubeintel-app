import * as React from "react"
import { useForm, ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { V1Container } from "@kubernetes/client-node"
import { Input } from "../ui/input"

// Define a Zod schema for our debug form fields
const debugFormSchema = z.object({
  debugImage: z.string().min(1, "Image is required"),
  debugTarget: z.string().optional(),
})

type DebugFormValues = z.infer<typeof debugFormSchema>;

interface PodActionsProps {
  podName: string
  containers?: V1Container[]
  onDelete: () => Promise<void>
  onDebug?: (image: string, target?: string) => Promise<void>
  onLogs?: (containerName?: string) => Promise<void>
}

export const PodActions = ({
  podName,
  containers,
  onDelete,
  onDebug,
  onLogs,
}: PodActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [debugDialogOpen, setDebugDialogOpen] = React.useState(false)

  // Form setup for debug dialog
  const form = useForm<DebugFormValues>({
    resolver: zodResolver(debugFormSchema),
    defaultValues: {
      debugImage: "busybox",
      debugTarget: "",
    },
  })

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete()
    }
    setDeleteDialogOpen(false)
  }

  // Called when the debug form is submitted
  const handleDebug = async (values: DebugFormValues) => {
    if (onDebug) {
      await onDebug(values.debugImage, values.debugTarget)
    }
    setDebugDialogOpen(false)
  }

  return (
    <div className="w-full pt-4 flex justify-center align-center">
      <Command className="rounded-lg border shadow-md md:max-w-[450px]">
        <CommandInput placeholder="Type an action..." />
        <CommandList>
          <CommandEmpty>No actions found.</CommandEmpty>

          <CommandGroup heading="Common Actions">
            {onLogs && (
              <CommandItem
                onSelect={() => onLogs("")} // Logs for all containers
              >
                <FileTerminal className="mr-2 h-4 w-4" />
                <span>View Logs (all containers)</span>
              </CommandItem>
            )}
            {onDebug && (
              <CommandItem onSelect={() => setDebugDialogOpen(true)}>
                <Bug className="mr-2 h-4 w-4" />
                <span>Debug Pod</span>
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Dangerous Actions">
            <CommandItem
              onSelect={() => setDeleteDialogOpen(true)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete Pod</span>
              <AlertTriangle className="ml-auto h-4 w-4" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pod?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the pod {podName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Pod
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debug Dialog */}
      <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debug Pod</DialogTitle>
            <DialogDescription>Choose debugger image and target</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleDebug)}
              className="py-4"
            >
              <FormField
                control={form.control}
                name="debugImage"
                render={({ field }: { field: ControllerRenderProps<DebugFormValues, "debugImage"> }) => (
                  <FormItem>
                    <FormLabel >Image</FormLabel>
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
              {containers && containers.length > 0 && (
                <FormField
                  control={form.control}
                  name="debugTarget"
                  render={({ field }: { field: ControllerRenderProps<DebugFormValues, "debugTarget"> }) => (
                    <FormItem className="">
                      <FormLabel>Target Container</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select target container" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Containers</SelectLabel>
                              {containers.map((container) => (
                                <SelectItem
                                  key={container.name}
                                  value={container.name}
                                >
                                  {container.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Choose which container to attach the debugger.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter className="my-4">
                <Button
                  variant="outline"
                  onClick={() => setDebugDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button variant="default" type="submit">
                  Debug Pod
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}