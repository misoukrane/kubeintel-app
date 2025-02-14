import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1DaemonSet } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { ContainersStatusTable } from '@/components/pods/containers-status-table';
import { StatusConditions } from '@/components/status-conditions';
import { Link } from 'react-router';
import { createLabelSelector } from '@/lib/strings';

interface DaemonSetViewProps {
  daemonSet?: V1DaemonSet;
  onCopy: (text: string) => void;
}

export const DaemonSetView = ({ daemonSet, onCopy }: DaemonSetViewProps) => {
  if (!daemonSet) return null;

  const { metadata, status, spec } = daemonSet;

  // Create the label selector string from the daemonset's selector
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
            status?.numberReady === status?.desiredNumberScheduled
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
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion type="multiple" defaultValue={["details", "labels"]} className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>DaemonSet Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Desired Number</h3>
                      <p>{status?.desiredNumberScheduled || 0} pods</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Current</h3>
                      <p>{status?.currentNumberScheduled || 0} pods</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Ready</h3>
                      <p>{status?.numberReady || 0} pods</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Update Strategy</h3>
                      <p>{spec?.updateStrategy?.type || 'RollingUpdate'}</p>
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
                              className='text-blue-600 hover:underline dark:text-blue-500'
                              to={`/pods?labelSelector=${encodeURIComponent(labelSelector)}`}
                            >View Pods →</Link>
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
              content={daemonSet}
              onCopy={onCopy}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};