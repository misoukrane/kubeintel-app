import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Service, V1ServicePort } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { ResourceActions } from '@/components/resources/resource-actions';
import { Badge } from '@/components/ui/badge';
import { Network, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '@/lib/routes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ResourceTypes } from '@/lib/strings';
import { formatPort, getExternalIPs } from '@/lib/services';

interface ServiceViewProps {
  service?: V1Service;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const ServiceView = ({
  service,
  onCopy,
  onDelete,
  onOpenEvents,
}: ServiceViewProps) => {
  if (!service) return null;

  const { metadata, spec } = service;
  const serviceType = spec?.type || 'ClusterIP';

  // Helper to check if selector is present
  const hasSelector = spec?.selector && Object.keys(spec.selector).length > 0;



  // Format the selector as a label selector string for URL
  const getSelectorAsLabelSelector = (): string => {
    if (!spec?.selector) return '';
    return Object.entries(spec.selector)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
  };

  // Service type badge
  const ServiceTypeBadge = ({ type }: { type: string }) => {
    switch (type) {
      case 'ClusterIP':
        return <Badge variant="outline">ClusterIP</Badge>;
      case 'NodePort':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">NodePort</Badge>;
      case 'LoadBalancer':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">LoadBalancer</Badge>;
      case 'ExternalName':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">ExternalName</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Network className="h-5 w-5 mr-2 text-blue-500" />
          <div>
            <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Namespace: {metadata?.namespace}
            </div>
          </div>
        </div>
        <ServiceTypeBadge type={serviceType} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ports">Ports</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion type="multiple" defaultValue={["details", "access", "labels"]} className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Service Details</AccordionTrigger>
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
                      <h3 className="font-medium">Type</h3>
                      <p>{serviceType}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Cluster IP</h3>
                      <p>{serviceType === 'ExternalName' ? 'None' : spec?.clusterIP || 'None'}</p>
                    </div>
                    {serviceType === 'ExternalName' && (
                      <div>
                        <h3 className="font-medium">External Name</h3>
                        <p>{spec?.externalName || 'N/A'}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">Session Affinity</h3>
                      <p>{spec?.sessionAffinity || 'None'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">IP Family Policy</h3>
                      <p>{spec?.ipFamilyPolicy || 'SingleStack'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">IP Families</h3>
                      <p>{spec?.ipFamilies?.join(', ') || 'IPv4'}</p>
                    </div>
                    {spec?.externalTrafficPolicy && (
                      <div>
                        <h3 className="font-medium">External Traffic Policy</h3>
                        <p>{spec.externalTrafficPolicy}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="access">
                <AccordionTrigger>Access Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {serviceType !== 'ExternalName' && (
                      <div>
                        <h3 className="font-medium mb-2">Internal Access</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-sm overflow-auto">
                          {metadata?.name}.{metadata?.namespace}.svc.cluster.local
                        </div>
                      </div>
                    )}

                    {getExternalIPs(service).length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">External Access</h3>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-sm overflow-auto">
                          {getExternalIPs(service).map((ip, i) => (
                            <div key={i} className="flex items-center">
                              <ExternalLink className="h-3 w-3 mr-2 text-blue-500" />
                              {ip}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {serviceType === 'NodePort' && (
                      <div>
                        <h3 className="font-medium mb-2">Node Port Access</h3>
                        <p className="text-sm text-muted-foreground">
                          This service is accessible on every node IP at the NodePort(s) listed in the Ports tab.
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {hasSelector && (
                <AccordionItem value="selector">
                  <AccordionTrigger>Pod Selector</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {spec?.selector && Object.entries(spec.selector).map(([key, value]) => (
                          <Badge key={key} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {key}={value}
                          </Badge>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`${ROUTES.PODS}?labelSelector=${getSelectorAsLabelSelector()}`}>
                          View matching pods
                        </Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

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

          <TabsContent value="ports">
            <Card>
              <CardContent className="pt-6">
                {!spec?.ports || spec.ports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No ports defined for this service</p>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Port</TableHead>
                          <TableHead>Target Port</TableHead>
                          <TableHead>Protocol</TableHead>
                          {(serviceType === 'NodePort' || serviceType === 'LoadBalancer') && <TableHead>Node Port</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spec.ports.map((port, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{port.name || '-'}</TableCell>
                            <TableCell>{port.port}</TableCell>
                            <TableCell>{port.targetPort?.toString() || port.port}</TableCell>
                            <TableCell>{port.protocol || 'TCP'}</TableCell>
                            {(serviceType === 'NodePort' || serviceType === 'LoadBalancer') && (
                              <TableCell>{port.nodePort || '-'}</TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Formatted Port String:</h3>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-sm">
                        {spec.ports.map(formatPort).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints">
            <Card>
              <CardContent className="pt-6">
                {!hasSelector ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      This service does not have a selector defined. It might be manually managed
                      or used with an ExternalName.
                    </p>
                    {serviceType === 'ExternalName' && (
                      <p>
                        External name:
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded ml-2">
                          {spec?.externalName}
                        </code>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>
                      This service targets pods matching the selector:
                      <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded ml-2">
                        {getSelectorAsLabelSelector()}
                      </code>
                    </p>
                    <Button
                      variant="outline"
                      asChild
                    >
                      <Link to={`${ROUTES.PODS}?labelSelector=${getSelectorAsLabelSelector()}`}>
                        View matching pods
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={service}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.Service}
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