import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1StatefulSet } from '@kubernetes/client-node';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { StatusConditions } from '@/components/status-conditions';
import { ContainersStatusTable } from '@/components/pods/containers-status-table';
import { Link } from 'react-router';
import { createLabelSelector, ResourceTypes } from '@/lib/strings';
import { ResourceActions } from '@/components/resources/resource-actions';

interface StatefulSetViewProps {
  statefulSet?: V1StatefulSet;
  onCopy: (text: string) => void;
  onScale?: (params: { currentReplicas: number; replicas: number }) => void;
  onDelete: () => void;
  onRestart: () => void;
  onLogs: (containerName?: string) => void;
  onOpenEvents: () => void;
}

export const StatefulSetView = ({
  statefulSet,
  onCopy,
  onScale,
  onDelete,
  onRestart,
  onLogs,
  onOpenEvents,
}: StatefulSetViewProps) => {
  if (!statefulSet) return null;

  const { metadata, status, spec } = statefulSet;

  // Create the label selector string from the statefulset's selector
  const labelSelector = createLabelSelector(spec?.selector?.matchLabels);

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {metadata?.namespace}
          </div>
        </div>
        <StatusBadge
          status={
            status?.readyReplicas === spec?.replicas
              ? 'Available'
              : 'Progressing'
          }
        />
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
            <Accordion
              type="multiple"
              defaultValue={['details', 'labels']}
              className="w-full"
            >
              <AccordionItem value="details">
                <AccordionTrigger>StatefulSet Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Replicas</h3>
                      <p>{spec?.replicas || 0} total</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Ready</h3>
                      <p>{status?.readyReplicas || 0} replicas</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Current</h3>
                      <p>{status?.currentReplicas || 0} replicas</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Update Strategy</h3>
                      <p>{spec?.updateStrategy?.type || 'RollingUpdate'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Service Name</h3>
                      <p>{spec?.serviceName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Pod Management</h3>
                      <p>{spec?.podManagementPolicy || 'OrderedReady'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Selector</h3>
                      <p>
                        {Object.entries(spec?.selector?.matchLabels || {})
                          .map(([k, v]) => `${k}=${v}`)
                          .join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div>
                      {labelSelector && (
                        <>
                          <h3 className="font-medium">Pods</h3>
                          <p>
                            <Link
                              className="text-blue-600 hover:underline dark:text-blue-500"
                              to={`/pods?labelSelector=${encodeURIComponent(labelSelector)}`}
                            >
                              View Pods →
                            </Link>
                          </p>
                        </>
                      )}
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
                  <p className="text-center text-muted-foreground">
                    No conditions found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="container">
            <Card>
              <CardHeader>
                <CardTitle>Container Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                {spec?.template?.spec?.containers && (
                  <ContainersStatusTable
                    containers={spec.template.spec.containers}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={statefulSet}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.StatefulSet}
              resourceName={metadata?.name}
              currentReplicas={spec?.replicas ?? 0}
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
