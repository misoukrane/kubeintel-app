import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1ClusterRole } from '@kubernetes/client-node';
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

interface ClusterRoleViewProps {
  clusterRole?: V1ClusterRole;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const ClusterRoleView = ({
  clusterRole,
  onCopy,
  onDelete,
  onOpenEvents,
}: ClusterRoleViewProps) => {
  if (!clusterRole) return null;

  const { metadata, rules } = clusterRole;

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
        <Badge variant="outline">ClusterRole</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
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
                <AccordionTrigger>ClusterRole Details</AccordionTrigger>
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

          <TabsContent value="rules">
            <Card>
              <CardContent className="pt-6">
                {!rules || rules.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No rules defined for this cluster role
                  </p>
                ) : (
                  <div className="space-y-6">
                    {rules.map((rule, ruleIndex) => (
                      <div key={ruleIndex} className="border rounded-md p-4">
                        <h3 className="font-medium mb-3">
                          Rule {ruleIndex + 1}
                        </h3>

                        <div className="space-y-4">
                          {rule.apiGroups && rule.apiGroups.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">
                                API Groups
                              </h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rule.apiGroups.map((group, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  >
                                    {group || '*'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {rule.resources && rule.resources.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Resources</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rule.resources.map((resource, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                                  >
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {rule.verbs && rule.verbs.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium">Verbs</h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rule.verbs.map((verb, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  >
                                    {verb}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {rule.resourceNames &&
                            rule.resourceNames.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium">
                                  Resource Names
                                </h4>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {rule.resourceNames.map((name, idx) => (
                                    <Badge key={idx} variant="outline">
                                      {name}
                                    </Badge>
                                  ))}
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
              content={clusterRole}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.ClusterRole}
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
