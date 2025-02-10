import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Pod } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ContainersStatusTable } from '@/components/pods/containers-status-table';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { VolumesTable } from '@/components/pods/volumes-table';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { StatusConditions } from '@/components/status-conditions';
import { PodActions } from './pod-actions';



interface PodViewProps {
  pod?: V1Pod;
  onCopy: (text: string) => void;
  onOpenShell: (containerName: string, shell: string) => Promise<void>;
  onOpenLogs: (containerName?: string) => Promise<void>;
  onDebug: (image: string, target?: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const PodView = ({ pod, onCopy, onOpenShell, onOpenLogs, onDelete, onDebug }: PodViewProps) => {
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
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="source">source</TabsTrigger>
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
                    onCopy={onCopy}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          <TabsContent value="containers" className="space-y-4">
            <ContainersStatusTable
              containerStatuses={status?.containerStatuses}
              containers={spec?.containers}
              initContainers={spec?.initContainers}
              onOpenShell={onOpenShell}
              onOpenLogs={onOpenLogs}
              onDebug={onDebug}
            />
          </TabsContent>

          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <CardTitle>Status Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {status?.conditions && status.conditions.length > 0 ? (
                  <StatusConditions conditions={status.conditions} />
                ) : (
                  <p className="text-center text-muted-foreground">No conditions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volumes">
            <Card>
              <CardHeader>
                <CardTitle>Volumes</CardTitle>
              </CardHeader>
              <CardContent>
                {spec?.volumes && spec.volumes.length > 0 ? (
                  <VolumesTable volumes={spec.volumes} onCopy={onCopy} />
                ) : (
                  <p className="text-center text-muted-foreground">No volumes found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={pod}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions" className="">
            <PodActions
              podName="my-pod"
              containers={spec?.containers || []}
              onDelete={onDelete}
              onLogs={onOpenLogs}
              onDebug={onDebug}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card >
  );
};