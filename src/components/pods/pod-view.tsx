import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { V1Pod } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PodViewProps {
  pod: V1Pod | null;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    Running: 'bg-green-500',
    Pending: 'bg-yellow-500',
    Failed: 'bg-red-500',
    Succeeded: 'bg-blue-500',
    Unknown: 'bg-gray-500',
  };

  return (
    <Badge className={`${colors[status] || colors.Unknown}`}>
      {status}
    </Badge>
  );
};

export const PodView = ({ pod }: PodViewProps) => {
  if (!pod) return null;

  const { metadata, status, spec } = pod;

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {metadata?.namespace}
          </div>
        </div>
        <StatusBadge status={status?.phase || 'Unknown'} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="containers">Containers</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="volumes">Volumes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Pod Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Pod IP</h3>
                      <p>{status?.podIP || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Node</h3>
                      <p>{spec?.nodeName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Service Account</h3>
                      <p>{spec?.serviceAccountName || 'default'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">QoS Class</h3>
                      <p>{status?.qosClass || 'N/A'}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="labels">
                <AccordionTrigger>Labels & Annotations</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Labels</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(metadata?.labels || {}).map(([key, value]) => (
                          <Badge key={key} variant="outline">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Annotations</h3>
                      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        {Object.entries(metadata?.annotations || {}).map(([key, value]) => (
                          <div key={key} className="pb-2">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="containers" className="space-y-4">
            {status?.containerStatuses?.map((container, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{container.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium">Image</h3>
                        <p className="text-sm">{container.image}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">State</h3>
                        <StatusBadge
                          status={
                            Object.keys(container.state || {})[0] || 'Unknown'
                          }
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">Restart Count</h3>
                        <p>{container.restartCount}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Ready</h3>
                        <Badge variant={container.ready ? "default" : "destructive"}>
                          {container.ready ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="conditions">
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <div className="p-4">
                {status?.conditions?.map((condition, index) => (
                  <Card key={index} className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-lg">{condition.type}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium">Status</h3>
                          <StatusBadge status={condition.status} />
                        </div>
                        <div>
                          <h3 className="font-medium">Last Transition</h3>
                          <p>{condition.lastTransitionTime ? new Date(condition.lastTransitionTime).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <h3 className="font-medium">Message</h3>
                          <p>{condition.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="volumes">
            <div className="space-y-4">
              {spec?.volumes?.map((volume, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{volume.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-auto">
                      {JSON.stringify(volume, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
