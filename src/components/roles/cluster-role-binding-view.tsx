import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1ClusterRoleBinding } from '@kubernetes/client-node';
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
import { ResourceTypes } from '@/lib/strings';

interface ClusterRoleBindingViewProps {
  clusterRoleBinding?: V1ClusterRoleBinding;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const ClusterRoleBindingView = ({
  clusterRoleBinding,
  onCopy,
  onDelete,
  onOpenEvents,
}: ClusterRoleBindingViewProps) => {
  if (!clusterRoleBinding) return null;

  const { metadata, roleRef, subjects } = clusterRoleBinding;

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <div>
            <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Cluster-scoped resource
            </div>
          </div>
        </div>
        <Badge variant="outline">ClusterRoleBinding</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
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
                <AccordionTrigger>ClusterRoleBinding Details</AccordionTrigger>
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

          <TabsContent value="details">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-3">Role Reference</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Kind</h4>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mt-1"
                        >
                          {roleRef?.kind || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Name</h4>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 mt-1"
                        >
                          {roleRef?.name || 'N/A'}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">API Group</h4>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300 mt-1"
                        >
                          {roleRef?.apiGroup || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {subjects && subjects.length > 0 && (
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-3">Subjects</h3>
                      <div className="space-y-4">
                        {subjects.map((subject, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium">Kind</h4>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mt-1"
                                >
                                  {subject.kind || 'N/A'}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Name</h4>
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 mt-1"
                                >
                                  {subject.name || 'N/A'}
                                </Badge>
                              </div>
                              {subject.namespace && (
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Namespace
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 mt-1"
                                  >
                                    {subject.namespace}
                                  </Badge>
                                </div>
                              )}
                              {subject.apiGroup && (
                                <div>
                                  <h4 className="text-sm font-medium">
                                    API Group
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300 mt-1"
                                  >
                                    {subject.apiGroup}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={clusterRoleBinding}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.ClusterRoleBinding}
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
