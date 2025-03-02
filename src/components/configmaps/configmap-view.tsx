import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1ConfigMap } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { ResourceActions } from '@/components/resources/resource-actions';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Tabs as SimpleTabs, TabsList as SimpleTabsList, TabsTrigger as SimpleTabsTrigger, TabsContent as SimpleTabsContent } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { ResourceTypes } from '@/lib/strings';

interface ConfigMapViewProps {
  configMap?: V1ConfigMap;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const ConfigMapView = ({
  configMap,
  onCopy,
  onDelete,
  onOpenEvents,
}: ConfigMapViewProps) => {
  if (!configMap) return null;

  const { metadata, data, binaryData } = configMap;
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(
    Object.keys(data || {}).length > 0 ? Object.keys(data || {})[0] : null
  );
  const [selectedBinaryKey, setSelectedBinaryKey] = useState<string | null>(
    Object.keys(binaryData || {}).length > 0 ? Object.keys(binaryData || {})[0] : null
  );

  // Count the number of keys in data and binaryData
  const dataCount = Object.keys(data || {}).length;
  const binaryDataCount = Object.keys(binaryData || {}).length;
  const totalKeys = dataCount + binaryDataCount;

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {metadata?.namespace}
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {totalKeys} {totalKeys === 1 ? 'Key' : 'Keys'}
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
            <Accordion type="multiple" defaultValue={["details", "labels"]} className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>ConfigMap Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p>{metadata?.creationTimestamp
                        ? new Date(metadata.creationTimestamp).toLocaleString()
                        : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Data Keys</h3>
                      <p>{dataCount} {dataCount === 1 ? 'key' : 'keys'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Binary Data Keys</h3>
                      <p>{binaryDataCount} {binaryDataCount === 1 ? 'key' : 'keys'}</p>
                    </div>
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
                {dataCount === 0 && binaryDataCount === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No data found in this ConfigMap</p>
                ) : (
                  <SimpleTabs defaultValue="regular" className="w-full">
                    {dataCount > 0 && (
                      <>
                        <SimpleTabsList className="mb-4">
                          <SimpleTabsTrigger value="regular">Regular Data ({dataCount})</SimpleTabsTrigger>
                          {binaryDataCount > 0 && (
                            <SimpleTabsTrigger value="binary">Binary Data ({binaryDataCount})</SimpleTabsTrigger>
                          )}
                        </SimpleTabsList>
                        <SimpleTabsContent value="regular">
                          <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1 border rounded">
                              <ScrollArea className="h-96">
                                <div className="p-2">
                                  {Object.keys(data || {}).map(key => (
                                    <button
                                      key={key}
                                      className={`w-full text-left p-2 rounded hover:bg-muted ${selectedDataKey === key ? 'bg-muted font-medium' : ''
                                        }`}
                                      onClick={() => setSelectedDataKey(key)}
                                    >
                                      {key}
                                    </button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                            <div className="col-span-3 border rounded p-4">
                              <div className="flex justify-between mb-2">
                                <h3 className="font-medium">{selectedDataKey}</h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => selectedDataKey && data && onCopy(data[selectedDataKey])}
                                >
                                  Copy
                                </Button>
                              </div>
                              <ScrollAreaCode
                                height="h-80"
                                onCopy={onCopy}
                                content={selectedDataKey && data ? data[selectedDataKey] : ''}
                                skipSerialization={true}
                              />
                            </div>
                          </div>
                        </SimpleTabsContent>
                      </>
                    )}
                    {binaryDataCount > 0 && (
                      <SimpleTabsContent value="binary">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-1 border rounded">
                            <ScrollArea className="h-96">
                              <div className="p-2">
                                {Object.keys(binaryData || {}).map(key => (
                                  <button
                                    key={key}
                                    className={`w-full text-left p-2 rounded hover:bg-muted ${selectedBinaryKey === key ? 'bg-muted font-medium' : ''
                                      }`}
                                    onClick={() => setSelectedBinaryKey(key)}
                                  >
                                    {key}
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                          <div className="col-span-3 border rounded p-4">
                            <div className="flex justify-between mb-2">
                              <h3 className="font-medium">{selectedBinaryKey}</h3>
                              <Badge variant="outline">Binary data</Badge>
                            </div>
                            <p className="text-muted-foreground">
                              Binary data is encoded in base64 format and cannot be displayed directly.
                            </p>
                          </div>
                        </div>
                      </SimpleTabsContent>
                    )}
                  </SimpleTabs>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={configMap}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.ConfigMap}
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