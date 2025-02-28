import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { V1CronJob } from '@kubernetes/client-node';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LabelsAnnotations } from '@/components/metadata/labels-annotations';
import { StatusBadge } from '@/components/status-badge';
import { ScrollAreaCode } from '@/components/scroll-area-code';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { createLabelSelector } from '@/lib/strings';
import { ResourceActions } from '@/components/resources/resource-actions';
import { ContainersStatusTable } from '@/components/pods/containers-status-table';
import { getCronJobStatus, getLastSchedule } from '@/lib/cronjobs';

interface CronJobViewProps {
  cronjob?: V1CronJob;
  onCopy: (text: string) => void;
  onDelete: () => void;
  onOpenEvents: () => void;
}

export const CronJobView = ({
  cronjob,
  onCopy,
  onDelete,
  onOpenEvents,
}: CronJobViewProps) => {
  if (!cronjob) return null;

  const { metadata, status, spec } = cronjob;

  const cronJobStatus = getCronJobStatus(cronjob);
  const lastScheduleTime = getLastSchedule(cronjob);

  const jobLabelSelector = createLabelSelector(cronjob.spec?.jobTemplate?.metadata?.labels);
  const podLabelSelector = createLabelSelector(cronjob.spec?.jobTemplate?.spec?.template?.metadata?.labels);

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">{metadata?.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Namespace: {metadata?.namespace}
          </div>
        </div>
        <StatusBadge status={cronJobStatus} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobTemplate">Job Template</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Accordion type="multiple" defaultValue={["details", "labels"]} className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>CronJob Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Schedule</h3>
                      <p>{spec?.schedule || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Concurrency Policy</h3>
                      <p>{spec?.concurrencyPolicy || 'Allow'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Suspend</h3>
                      <p>{spec?.suspend ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Last Schedule</h3>
                      <p>{lastScheduleTime}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Starting Deadline</h3>
                      <p>{spec?.startingDeadlineSeconds ? `${spec.startingDeadlineSeconds}s` : 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Active Jobs</h3>
                      <p>{status?.active?.length || 0}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Successful Jobs History Limit</h3>
                      <p>{spec?.successfulJobsHistoryLimit || 3}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Failed Jobs History Limit</h3>
                      <p>{spec?.failedJobsHistoryLimit || 1}</p>
                    </div>
                    <div>
                      {jobLabelSelector && (
                        <>
                          <h3 className="font-medium">Jobs</h3>
                          <p>
                            <Link
                              className='text-blue-600 hover:underline dark:text-blue-500'
                              to={`/jobs?labelSelector=${encodeURIComponent(jobLabelSelector)}`}
                            >View Jobs →</Link>
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      {podLabelSelector && (
                        <>
                          <h3 className="font-medium">Pods</h3>
                          <p>
                            <Link
                              className='text-blue-600 hover:underline dark:text-blue-500'
                              to={`/pods?labelSelector=${encodeURIComponent(podLabelSelector)}`}
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

              {status?.active && status.active.length > 0 && (
                <AccordionItem value="activeJobs">
                  <AccordionTrigger>Active Jobs</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {status.active.map((jobRef, idx) => (
                        <div key={idx} className="p-2 border rounded">
                          <Link
                            to={`/jobs/${jobRef.name}`}
                            className="text-blue-600 hover:underline dark:text-blue-500"
                          >
                            {jobRef.name}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </TabsContent>

          <TabsContent value="jobTemplate">
            <Card>
              <CardHeader>
                <CardTitle>Job Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Template Labels</h3>
                    <div className="mt-2">
                      {spec?.jobTemplate?.metadata?.labels ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(spec.jobTemplate.metadata.labels).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                              {key}={value}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No labels defined</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Containers</h3>
                    {spec?.jobTemplate?.spec?.template?.spec?.containers && (
                      <ContainersStatusTable
                        containers={spec.jobTemplate.spec.template.spec.containers}
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium">Restart Policy</h3>
                    <p>{spec?.jobTemplate?.spec?.template?.spec?.restartPolicy || 'Never'}</p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => onCopy(JSON.stringify(spec?.jobTemplate || {}, null, 2))}
                  >
                    Copy Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="source">
            <ScrollAreaCode
              height="h-screen"
              content={cronjob}
              onCopy={onCopy}
            />
          </TabsContent>

          <TabsContent value="actions">
            <div className="space-y-4">
              <ResourceActions
                kind="CronJob"
                resourceName={metadata?.name}
                onDelete={onDelete}
                onOpenEvents={onOpenEvents}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};