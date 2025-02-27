import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1Job } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { StatusConditions } from '@/components/status-conditions';
import { ContainersStatusTable } from '@/components/pods/containers-status-table';
import { Link } from 'react-router';
import { createLabelSelector } from '@/lib/strings';
import { ResourceActions } from '@/components/resources/resource-actions';
import { Badge } from '@/components/ui/badge';

interface JobViewProps {
  job?: V1Job;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onRestart: () => void;
  onLogs: (containerName?: string) => void;
  onOpenEvents: () => void;
}

export const JobView = ({
  job,
  onCopy,
  onDelete,
  onRestart,
  onLogs,
  onOpenEvents,
}: JobViewProps) => {
  if (!job) return null;

  const { metadata, status, spec } = job;

  // Get job status
  const getJobStatus = () => {
    if (status?.succeeded && status.succeeded > 0) {
      return { status: 'Succeeded', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    } else if (status?.failed && status.failed > 0) {
      return { status: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
    } else if (status?.active && status.active > 0) {
      return { status: 'Active', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
    }
    return { status: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
  };

  // Calculate job duration
  const getJobDuration = () => {
    const startTime = status?.startTime ? new Date(status.startTime) : null;
    const completionTime = status?.completionTime ? new Date(status.completionTime) : null;

    if (startTime && completionTime) {
      // Job is complete, show duration
      const durationMs = completionTime.getTime() - startTime.getTime();
      return formatDuration(durationMs);
    } else if (startTime) {
      // Job is running, show duration so far
      const durationMs = new Date().getTime() - startTime.getTime();
      return `${formatDuration(durationMs)} (running)`;
    }
    return 'N/A';
  };

  // Format duration in a human-readable format
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Create the label selector string from the job's selector
  const labelSelector = createLabelSelector(spec?.selector?.matchLabels);
  const jobStatus = getJobStatus();

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {metadata?.namespace}
          </div>
        </div>
        <Badge variant="outline" className={jobStatus.className}>
          {jobStatus.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="containers">Containers</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion type="multiple" defaultValue={["details", "labels"]} className="w-full">
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
                      <p>{spec?.backoffLimit !== undefined ? spec.backoffLimit : 6} retries</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Duration</h3>
                      <p>{getJobDuration()}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Start Time</h3>
                      <p>{status?.startTime
                        ? new Date(status.startTime).toLocaleString()
                        : 'Not started'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Completion Time</h3>
                      <p>{status?.completionTime
                        ? new Date(status.completionTime).toLocaleString()
                        : 'Not completed'}</p>
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
            <ScrollAreaCode
              height="h-screen"
              content={job}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ResourceActions
              kind="Job"
              resourceName={metadata?.name}
              onDelete={onDelete}
              onRestart={onRestart}
              onLogs={onLogs}
              onOpenEvents={onOpenEvents}
            // Jobs don't support scaling like StatefulSets
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};