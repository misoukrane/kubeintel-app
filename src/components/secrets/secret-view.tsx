import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Secret } from '@kubernetes/client-node';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { ResourceActions } from '@/components/resources/resource-actions';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Button } from '../ui/button';
import { ResourceTypes } from '@/lib/strings';
import { ShieldAlert, AlertTriangle, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SecretViewProps {
  secret?: V1Secret;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const SecretView = ({
  secret,
  onCopy,
  onDelete,
  onOpenEvents,
}: SecretViewProps) => {
  if (!secret) return null;

  const { metadata, data, type } = secret;

  // Count the number of keys in data
  const dataCount = Object.keys(data || {}).length;
  const [selectedKey, setSelectedKey] = useState<string | null>(
    Object.keys(data || {}).length > 0 ? Object.keys(data || {})[0] : null
  );

  // Determine if this is a system secret
  const isSystemSecret = type?.startsWith('kubernetes.io/') || false;

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Lock className="h-5 w-5 mr-2 text-amber-500" />
          <div>
            <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Namespace: {metadata?.namespace}
            </div>
          </div>
        </div>
        <Badge
          variant={isSystemSecret ? 'secondary' : 'outline'}
          className={
            isSystemSecret
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
              : ''
          }
        >
          {type || 'Opaque'}
        </Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion
              type="multiple"
              defaultValue={['details', 'labels']}
              className="w-full"
            >
              <AccordionItem value="details">
                <AccordionTrigger>Secret Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p>
                        {metadata?.creationTimestamp
                          ? new Date(
                              metadata.creationTimestamp
                            ).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Type</h3>
                      <p>{type || 'Opaque'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Data Keys</h3>
                      <p>
                        {dataCount} {dataCount === 1 ? 'key' : 'keys'}
                      </p>
                    </div>
                    {isSystemSecret && (
                      <div className="col-span-2">
                        <Alert variant="destructive" className="mt-4">
                          <ShieldAlert className="h-4 w-4" />
                          <AlertTitle>System Secret</AlertTitle>
                          <AlertDescription>
                            This is a Kubernetes system secret with type{' '}
                            <code>{type}</code>. Modifying it directly may break
                            cluster functionality.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="labels">
                <AccordionTrigger>Labels & Annotations</AccordionTrigger>
                <AccordionContent>
                  <LabelsAnnotations
                    labels={metadata?.labels}
                    annotations={metadata?.annotations}
                    onCopy={onCopy}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sensitive Information</AlertTitle>
                  <AlertDescription>
                    Secret values are base64 encoded and can contain sensitive
                    information. Exercise caution when handling these values.
                  </AlertDescription>
                </Alert>
                {dataCount === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No data found in this Secret
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 border rounded">
                      <ScrollArea className="h-96">
                        <div className="p-2">
                          {Object.keys(data || {}).map((key) => (
                            <button
                              key={key}
                              className={`w-full text-left p-2 rounded hover:bg-muted ${
                                selectedKey === key
                                  ? 'bg-muted font-medium'
                                  : ''
                              }`}
                              onClick={() => setSelectedKey(key)}
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div className="col-span-3 border rounded p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{selectedKey}</h3>
                        <div className="space-x-2">
                          <Badge variant="outline">base64 encoded</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              selectedKey && data && onCopy(data[selectedKey])
                            }
                          >
                            Copy encoded value
                          </Button>
                        </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded font-mono text-sm break-all">
                        {selectedKey && data ? data[selectedKey] : ''}
                      </div>
                      <p className="text-muted-foreground text-xs mt-2">
                        Note: Decode this value with{' '}
                        <code>echo 'VALUE' | base64 -d</code> to see the actual
                        content
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={secret}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.Secret}
              resourceName={metadata?.name}
              onDelete={onDelete}
              onOpenEvents={onOpenEvents}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
