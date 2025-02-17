import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Node } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { StatusConditions } from '@/components/status-conditions';
import { Link } from 'react-router';

interface NodeViewProps {
  node?: V1Node;
  onCopy: (text: string) => void;
  onDelete?: () => void;
  onCordon?: () => void;
  onUncordon?: () => void;
  onDrain?: () => void;
  onOpenEvents?: () => void;
}

export const NodeView = ({
  node,
  onCopy,
}: NodeViewProps) => {
  if (!node) return null;

  const { metadata, status, spec } = node;
  const isSchedulable = !spec?.unschedulable;
  const nodeStatus = status?.conditions?.find((condition) => condition.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady';

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Role: {
              metadata?.labels?.['node-role.kubernetes.io/control-plane'] ? 'Control Plane' :
                metadata?.labels?.['node-role.kubernetes.io/master'] ? 'Master' : 'Worker'
            }
          </div>
        </div>
        <StatusBadge
          status={nodeStatus}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion type="multiple" defaultValue={["details", "info", "labels"]} className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Node Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Internal IP</h3>
                      <p>{status?.addresses?.find(addr => addr.type === 'InternalIP')?.address || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Hostname</h3>
                      <p>{status?.addresses?.find(addr => addr.type === 'Hostname')?.address || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Architecture</h3>
                      <p>{status?.nodeInfo?.architecture || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">OS Image</h3>
                      <p>{status?.nodeInfo?.osImage || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Container Runtime</h3>
                      <p>{status?.nodeInfo?.containerRuntimeVersion || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Kubelet Version</h3>
                      <p>{status?.nodeInfo?.kubeletVersion || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">kernel Version</h3>
                      <p>{status?.nodeInfo?.kernelVersion || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Schedulable</h3>
                      <p><StatusBadge status={isSchedulable ? 'Enabled' : 'Disabled'} /></p>
                    </div>
                    <div>
                      <h3 className="font-medium">Pods</h3>
                      <p>
                        <Link
                          className='text-blue-600 hover:underline dark:text-blue-500'
                          to={`/nodes/${metadata?.name}/pods`}>
                          View Pods →
                        </Link>
                      </p>
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

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Capacity</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">CPU</h4>
                        <p>{status?.capacity?.cpu || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Memory</h4>
                        <p>{status?.capacity?.memory || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Pods</h4>
                        <p>{status?.capacity?.pods || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Ephemeral Storage</h4>
                        <p>{status?.capacity?.['ephemeral-storage'] || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Allocatable</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">CPU</h4>
                        <p>{status?.allocatable?.cpu || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Memory</h4>
                        <p>{status?.allocatable?.memory || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Pods</h4>
                        <p>{status?.allocatable?.pods || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Ephemeral Storage</h4>
                        <p>{status?.allocatable?.['ephemeral-storage'] || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <CardTitle>Node Conditions</CardTitle>
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

          <TabsContent value="actions">
            actions
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={node}
              onCopy={onCopy}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};