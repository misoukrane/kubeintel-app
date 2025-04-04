import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Job } from '@kubernetes/client-node';
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
import { getJobDuration, getJobStatus } from '@/lib/jobs';

interface JobViewProps {
  job?: V1Job;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onLogs: (containerName?: string) => void;
  onOpenEvents: () => void;
}

export const JobView = ({
  job,
  onCopy,
  onDelete,
  onLogs,
  onOpenEvents,
}: JobViewProps) => {
  if (!job) return null;

  const { metadata, status, spec } = job;

  // Create the label selector string from the job's selector
  const labelSelector = createLabelSelector(spec?.selector?.matchLabels);
  const jobStatus = getJobStatus(status);

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {metadata?.namespace}
          </div>
        </div>
        <StatusBadge status={jobStatus} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="containers">Containers</TabsTrigger>
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
                <AccordionTrigger>Job Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Completions</h3>
                      <p>{spec?.completions || 1} required</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Parallelism</h3>
                      <p>{spec?.parallelism || 1} max concurrent pods</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Active</h3>
                      <p>{status?.active || 0} pods</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Succeeded</h3>
                      <p>{status?.succeeded || 0} pods</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Failed</h3>
                      <p>{status?.failed || 0} pods</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Completion Mode</h3>
                      <p>{spec?.completionMode || 'NonIndexed'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Backoff Limit</h3>
                      <p>
                        {spec?.backoffLimit !== undefined
                          ? spec.backoffLimit
                          : 6}{' '}
                        retries
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Duration</h3>
                      <p>{getJobDuration(job)}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Start Time</h3>
                      <p>
                        {status?.startTime
                          ? new Date(status.startTime).toLocaleString()
                          : 'Not started'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Completion Time</h3>
                      <p>
                        {status?.completionTime
                          ? new Date(status.completionTime).toLocaleString()
                          : 'Not completed'}
                      </p>
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

          <TabsContent value="containers">
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
            <ScrollAreaCode height="h-screen" content={job} onCopy={onCopy} />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind={ResourceTypes.Job}
              resourceName={metadata?.name}
              onDelete={onDelete}
              onLogs={onLogs}
              onOpenEvents={onOpenEvents}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
