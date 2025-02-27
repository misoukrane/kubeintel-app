import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Route error:', error); // Log the error to console

  let errorMessage = 'An unexpected error occurred';
  let errorStatus = '';
  let stackTrace = '';

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || 'Unknown error occurred';
    // Some route errors might include stack trace
    if ('error' in error && error['error'] instanceof Error) {
      stackTrace = (error['error'] as Error).stack || '';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    stackTrace = error.stack || '';
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-5xl">
        <CardHeader className="text-red-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          {errorStatus && (
            <CardDescription className="text-red-400">
              {errorStatus}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{errorMessage}</p>

          <div className="mt-4 space-y-2">
            {stackTrace && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                <details className="text-sm" open>
                  <summary className="font-medium mb-2">Stack Trace</summary>
                  <pre className="whitespace-pre-wrap overflow-auto max-h-56 text-xs font-mono">
                    {stackTrace}
                  </pre>
                </details>
              </div>
            )}

            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
              <details className="text-sm">
                <summary className="font-medium mb-2">Error Object</summary>
                <pre className="whitespace-pre-wrap overflow-auto max-h-56 text-xs font-mono">
                  {JSON.stringify(
                    error,
                    // Custom replacer to handle circular references
                    (key, value) => {
                      if (key === 'stack' || key === '_stack') return undefined; // Skip stack in the JSON output since we show it separately
                      if (value === window) return '[window object]';
                      if (value === document) return '[document object]';
                      if (value instanceof Element)
                        return `[${value.tagName} element]`;
                      return value;
                    },
                    2
                  )}
                </pre>
              </details>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => navigate(ROUTES.HOME)} variant="default">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
