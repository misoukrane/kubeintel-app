import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Deployment } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { StatusConditions } from '@/components/status-conditions';
import { ContainersStatusTable } from '@/components/pods/containers-status-table';
import { DeploymentActions } from './deployment-actions';

interface DeploymentViewProps {
  deployment?: V1Deployment;
  onCopy: (text: string) => void;
  onScale: (params: { currentReplicas: number; replicas: number }) => void;
  onDelete: () => void;
  onRestart: () => void;
  onLogs: (containerName?: string) => void;
  onOpenEvents: () => void;
}

export const DeploymentView = ({ deployment, onCopy, onScale, onDelete, onRestart, onLogs, onOpenEvents }: DeploymentViewProps) => {
  if (!deployment) return null;

  const { metadata, status, spec } = deployment;

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {metadata?.namespace}
          </div>
        </div>
        <StatusBadge status={deployment.status?.availableReplicas === spec?.replicas ? 'Available' : 'Progressing'} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="container">Containers</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion type="multiple" defaultValue={["details", "labels"]} className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Deployment Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Replicas</h3>
                      <p>{status?.replicas || 0} total</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Available</h3>
                      <p>{status?.availableReplicas || 0} replicas</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Updated</h3>
                      <p>{status?.updatedReplicas || 0} replicas</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Strategy</h3>
                      <p>{spec?.strategy?.type || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Selector</h3>
                      <p>{Object.entries(spec?.selector?.matchLabels || {}).map(([k, v]) => `${k}=${v}`).join(', ') || 'N/A'}</p>
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

          <TabsContent value="container">
            <ContainersStatusTable
              containers={spec?.template.spec?.containers}
              initContainers={spec?.template.spec?.initContainers}
              ephemeralContainers={spec?.template.spec?.ephemeralContainers}
            />
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={deployment}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <DeploymentActions
              deploymentName={deployment.metadata?.name}
              currentReplicas={deployment.status?.replicas || 0}
              onScale={onScale}
              onDelete={onDelete}
              onRestart={onRestart}
              onLogs={onLogs}
              onOpenEvents={onOpenEvents}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};