import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1PersistentVolume } from '@kubernetes/client-node';
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

interface PersistentVolumeViewProps {
  persistentVolume?: V1PersistentVolume;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const PersistentVolumeView = ({
  persistentVolume,
  onCopy,
  onDelete,
  onOpenEvents,
}: PersistentVolumeViewProps) => {
  if (!persistentVolume) return null;

  const { metadata, spec, status } = persistentVolume;
  const phase = status?.phase || 'Unknown';

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Storage Class: {spec?.storageClassName || 'N/A'}
          </div>
        </div>
        <StatusBadge status={phase} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
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
                <AccordionTrigger>Volume Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Status</h3>
                      <StatusBadge status={phase} />
                    </div>
                    <div>
                      <h3 className="font-medium">Reclaim Policy</h3>
                      <p>{spec?.persistentVolumeReclaimPolicy || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Storage Class</h3>
                      <p>{spec?.storageClassName || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Mount Options</h3>
                      <p>{spec?.mountOptions?.join(', ') || 'N/A'}</p>
                    </div>
                    {spec?.claimRef && (
                      <div>
                        <h3 className="font-medium">Claim</h3>
                        <p>
                          {spec.claimRef.namespace && spec.claimRef.name ? (
                            <Link
                              className="text-blue-600 hover:underline dark:text-blue-500"
                              to={`/namespaces/${spec.claimRef.namespace}/persistent-volume-claims/${spec.claimRef.name}`}
                            >
                              {spec.claimRef.namespace}/{spec.claimRef.name} →
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </p>
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

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Capacity</h3>
                    <p>{spec?.capacity?.['storage'] || 'N/A'}</p>
                  </div>
                  {spec?.volumeMode && (
                    <div>
                      <h3 className="font-medium">Volume Mode</h3>
                      <p>{spec.volumeMode}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium text-lg mb-4">Volume Source</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {spec?.hostPath && (
                      <>
                        <div>
                          <h4 className="font-medium">Type</h4>
                          <p>HostPath</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Path</h4>
                          <p>{spec.hostPath.path}</p>
                        </div>
                      </>
                    )}
                    {spec?.nfs && (
                      <>
                        <div>
                          <h4 className="font-medium">Type</h4>
                          <p>NFS</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Server</h4>
                          <p>{spec.nfs.server}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Path</h4>
                          <p>{spec.nfs.path}</p>
                        </div>
                      </>
                    )}
                    {spec?.awsElasticBlockStore && (
                      <>
                        <div>
                          <h4 className="font-medium">Type</h4>
                          <p>AWS EBS</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Volume ID</h4>
                          <p>{spec.awsElasticBlockStore.volumeID}</p>
                        </div>
                      </>
                    )}
                    {spec?.gcePersistentDisk && (
                      <>
                        <div>
                          <h4 className="font-medium">Type</h4>
                          <p>GCE Persistent Disk</p>
                        </div>
                        <div>
                          <h4 className="font-medium">PD Name</h4>
                          <p>{spec.gcePersistentDisk.pdName}</p>
                        </div>
                      </>
                    )}
                    {/* Add more volume source types as needed */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">Access Modes</h3>
                    <ul className="list-disc list-inside pl-4 mt-2">
                      {spec?.accessModes && spec.accessModes.length > 0 ? (
                        spec.accessModes.map((mode, index) => (
                          <li key={index}>{mode}</li>
                        ))
                      ) : (
                        <li>No access modes defined</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg">Node Affinity</h3>
                    {spec?.nodeAffinity ? (
                      <div className="mt-2">
                        <h4 className="font-medium">Required</h4>
                        {spec.nodeAffinity.required ? (
                          <pre className="bg-muted p-2 rounded-md text-xs whitespace-pre-wrap mt-1">
                            {JSON.stringify(spec.nodeAffinity.required, null, 2)}
                          </pre>
                        ) : (
                          <p>No required node affinity defined</p>
                        )}
                      </div>
                    ) : (
                      <p>No node affinity defined</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.PersistentVolume}
              resourceName={metadata?.name}
              onDelete={onDelete}
              onOpenEvents={onOpenEvents}
              canScale={false}
            />
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode height="h-screen" content={persistentVolume} onCopy={onCopy} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 