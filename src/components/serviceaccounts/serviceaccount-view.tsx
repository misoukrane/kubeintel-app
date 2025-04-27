import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1ServiceAccount } from '@kubernetes/client-node';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { ResourceActions } from '@/components/resources/resource-actions';
import { Badge } from '@/components/ui/badge';
import { Key } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '@/lib/routes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ResourceTypes } from '@/lib/strings';

interface ServiceAccountViewProps {
  serviceAccount?: V1ServiceAccount;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const ServiceAccountView = ({
  serviceAccount,
  onCopy,
  onDelete,
  onOpenEvents,
}: ServiceAccountViewProps) => {
  if (!serviceAccount) return null;

  const { metadata, secrets, imagePullSecrets } = serviceAccount;

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Key className="h-5 w-5 mr-2 text-yellow-500" />
          <div>
            <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Namespace: {metadata?.namespace}
            </div>
          </div>
        </div>
        <Badge variant="outline">ServiceAccount</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
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
                <AccordionTrigger>ServiceAccount Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p>
                        {metadata?.creationTimestamp
                          ? new Date(
                              metadata.creationTimestamp
                            ).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Secret Count</h3>
                      <p>{secrets?.length || 0}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Image Pull Secrets Count</h3>
                      <p>{imagePullSecrets?.length || 0}</p>
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

          <TabsContent value="secrets">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {secrets && secrets.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Mounted Secrets</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {secrets.map((secret, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {secret.name && (
                                  <Link 
                                    to={`${ROUTES.SECRETS}/${secret.name}?namespace=${metadata?.namespace}`}
                                    className="text-blue-500 hover:underline"
                                  >
                                    {secret.name}
                                  </Link>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No secrets attached to this service account</p>
                    </div>
                  )}

                  {imagePullSecrets && imagePullSecrets.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Image Pull Secrets</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {imagePullSecrets.map((secret, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {secret.name && (
                                  <Link 
                                    to={`${ROUTES.SECRETS}/${secret.name}?namespace=${metadata?.namespace}`}
                                    className="text-blue-500 hover:underline"
                                  >
                                    {secret.name}
                                  </Link>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No image pull secrets attached to this service account</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={serviceAccount}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.ServiceAccount}
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
