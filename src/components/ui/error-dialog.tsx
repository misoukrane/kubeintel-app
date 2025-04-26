import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface ErrorDetails {
  message: string;
  type?: string;
  code?: string;
  param?: string | null;
  [key: string]: any;
}

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  error: ErrorDetails | null;
}

export function ErrorDialog({ open, onClose, error }: ErrorDialogProps) {
  if (!error) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <X className="h-5 w-5 mr-2" />
            Error Occurred
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 py-2">
            <div>
              <h3 className="font-medium">Message</h3>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>

            {error.type && (
              <div>
                <h3 className="font-medium">Type</h3>
                <p className="text-sm text-muted-foreground">{error.type}</p>
              </div>
            )}

            {error.code && (
              <div>
                <h3 className="font-medium">Error Code</h3>
                <p className="text-sm text-muted-foreground">{error.code}</p>
              </div>
            )}

            {/* Display any other error properties */}
            {Object.entries(error).map(
              ([key, value]) =>
                !["message", "type", "code"].includes(key) &&
                value !== null &&
                value !== undefined && (
                  <div key={key}>
                    <h3 className="font-medium capitalize">{key}</h3>
                    <p className="text-sm text-muted-foreground">
                      {typeof value === "object"
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </p>
                  </div>
                )
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}