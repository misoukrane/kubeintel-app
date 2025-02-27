import { V1Job, V1JobStatus } from '@kubernetes/client-node';
import { formatDuration } from './time';

// Helper function to get job status
// Get job status
export const getJobStatus = (status: V1JobStatus | undefined) => {
  if (status?.succeeded && status.succeeded > 0) {
    return 'Succeeded';
  } else if (status?.failed && status.failed > 0) {
    return 'Failed';
  } else if (status?.active && status.active > 0) {
    return 'Active';
  }
  return 'Pending';
};

// Calculate job duration or age
export const getJobDuration = (job: V1Job) => {
  const startTime = job.status?.startTime
    ? new Date(job.status.startTime)
    : null;
  const completionTime = job.status?.completionTime
    ? new Date(job.status.completionTime)
    : null;

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
