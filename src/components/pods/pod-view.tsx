import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Pod } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ContainersStatusTable } from '@/components/pods/containers-status-table';
import { StatusConditionsTable } from '@/components/pods/status-conditions-table';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';

interface PodViewProps {
  pod: V1Pod | null;
}

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
            <Accordion type="multiple" defaultValue={["details", "labels"]} className="w-full">
              <AccordionItem value="details" >
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
                  <LabelsAnnotations
                    labels={metadata?.labels}
                    annotations={metadata?.annotations}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="containers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Container Statuses</CardTitle>
              </CardHeader>
              <CardContent>
                {status?.containerStatuses && status.containerStatuses.length > 0 ? (
                  <ContainersStatusTable containerStatuses={status.containerStatuses} />
                ) : (
                  <p className="text-center text-muted-foreground">No containers found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <CardTitle>Status Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {status?.conditions && status.conditions.length > 0 ? (
                  <StatusConditionsTable conditions={status.conditions} />
                ) : (
                  <p className="text-center text-muted-foreground">No conditions found</p>
                )}
              </CardContent>
            </Card>
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
