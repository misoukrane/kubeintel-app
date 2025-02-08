import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ErrorAlert(props: { title?: string; error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{props.title || 'Error'}</AlertTitle>
      <AlertDescription className="mt-4 whitespace-pre-wrap break-words max-w-[80vw]">
        {props.error instanceof Error
          ? props.error.message
          : JSON.stringify(props.error, null, 2)}
      </AlertDescription>
    </Alert>
  );
}
