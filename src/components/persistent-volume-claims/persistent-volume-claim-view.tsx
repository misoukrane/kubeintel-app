import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { Link } from 'react-router';
import { ResourceActions } from '@/components/resources/resource-actions';
import { ResourceTypes } from '@/lib/strings';

interface PersistentVolumeClaimViewProps {
  persistentVolumeClaim?: V1PersistentVolumeClaim;
  namespace: string;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const PersistentVolumeClaimView = ({
  persistentVolumeClaim,
  namespace,
  onCopy,
  onDelete,
  onOpenEvents,
}: PersistentVolumeClaimViewProps) => {
  if (!persistentVolumeClaim) return null;

  const { metadata, spec, status } = persistentVolumeClaim;
  const phase = status?.phase || 'Unknown';

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {namespace} | Storage Class: {spec?.storageClassName || 'N/A'}
          </div>
        </div>
        <StatusBadge status={phase} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion
              type="multiple"
              defaultValue={['details', 'labels']}
              className="w-full"
            >
              <AccordionItem value="details">
                <AccordionTrigger>Claim Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <StatusBadge status={phase} />
                    </div>
                    <div>
                      <h3 className="font-medium">Storage Class</h3>
                      <p>{spec?.storageClassName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Volume Name</h3>
                      <p>
                        {spec?.volumeName ? (
                          <Link
                            className="text-blue-600 hover:underline dark:text-blue-500"
                            to={`/persistent-volumes/${spec.volumeName}`}
                          >
                            {spec.volumeName} →
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Access Modes</h3>
                      <p>{spec?.accessModes?.join(', ') || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Volume Mode</h3>
                      <p>{spec?.volumeMode || 'Filesystem'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p>
                        {metadata?.creationTimestamp
                          ? new Date(metadata.creationTimestamp).toLocaleString()
                          : 'N/A'}
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

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Requested Storage</h3>
                    <p>{spec?.resources?.requests?.['storage'] || 'N/A'}</p>
                  </div>
                  {status?.capacity && (
                    <div>
                      <h3 className="font-medium">Allocated Storage</h3>
                      <p>{status.capacity['storage'] || 'N/A'}</p>
                    </div>
                  )}
                </div>

                {spec?.selector && (
                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-4">Volume Selector</h3>
                    {spec.selector.matchLabels && (
                      <div>
                        <h4 className="font-medium">Match Labels</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(spec.selector.matchLabels).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                              >
                                {key}={value}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {spec.selector.matchExpressions && spec.selector.matchExpressions.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-medium">Match Expressions</h4>
                        <pre className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap mt-1">
                          {JSON.stringify(spec.selector.matchExpressions, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.PersistentVolumeClaim}
              resourceName={metadata?.name}
              onDelete={onDelete}
              onOpenEvents={onOpenEvents}
              canScale={false}
            />
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode height="h-screen" content={persistentVolumeClaim} onCopy={onCopy} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 