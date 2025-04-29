import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1RoleBinding } from '@kubernetes/client-node';
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
import { Link2 } from 'lucide-react';
import { ResourceTypes } from '@/lib/strings';

interface RoleBindingViewProps {
  roleBinding?: V1RoleBinding;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const RoleBindingView = ({
  roleBinding,
  onCopy,
  onDelete,
  onOpenEvents,
}: RoleBindingViewProps) => {
  if (!roleBinding) return null;

  const { metadata, subjects, roleRef } = roleBinding;

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Link2 className="h-5 w-5 mr-2 text-blue-500" />
          <div>
            <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Namespace: {metadata?.namespace}
            </div>
          </div>
        </div>
        <Badge variant="outline">RoleBinding</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
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
                <AccordionTrigger>RoleBinding Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Role Reference</h3>
                      {roleRef ? (
                        <div className="space-y-2 mt-2">
                          <div>
                            <span className="text-muted-foreground">Kind:</span>{' '}
                            <Badge
                              variant="outline"
                              className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                            >
                              {roleRef.kind}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Name:</span>{' '}
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            >
                              {roleRef.name}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">API Group:</span>{' '}
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                            >
                              {roleRef.apiGroup}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">None defined</div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium">Created</h3>
                      <p className="mt-2">
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

          <TabsContent value="subjects">
            <Card>
              <CardContent className="pt-6">
                {!subjects || subjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No subjects defined for this role binding
                  </p>
                ) : (
                  <div className="space-y-6">
                    {subjects.map((subject, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <h3 className="font-medium mb-3">Subject {index + 1}</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium">Kind</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              >
                                {subject.kind}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium">Name</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              >
                                {subject.name}
                              </Badge>
                            </div>
                          </div>

                          {subject.namespace && (
                            <div>
                              <h4 className="text-sm font-medium">Namespace</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                                >
                                  {subject.namespace}
                                </Badge>
                              </div>
                            </div>
                          )}

                          {subject.apiGroup && (
                            <div>
                              <h4 className="text-sm font-medium">API Group</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                                >
                                  {subject.apiGroup}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={roleBinding}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.RoleBinding}
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