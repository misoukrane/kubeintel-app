import { V1CronJob } from '@kubernetes/client-node';
import { getAge } from './time';

// Helper function to get status
export const getCronJobStatus = (cronjob: V1CronJob) => {
  // Check if it's suspended
  if (cronjob.spec?.suspend) {
    return 'Suspended';
  }

  // Check if we have any active jobs
  const active = cronjob.status?.active?.length || 0;
  if (active > 0) {
    return 'Active';
  }

  return 'Scheduled';
};

// Helper function to get schedule
export const getSchedule = (cronjob: V1CronJob) => {
  return cronjob.spec?.schedule || 'Unknown';
};

// Helper function to get next scheduled time
export const getNextSchedule = (cronjob: V1CronJob) => {
  if (cronjob.status?.lastScheduleTime && !cronjob.spec?.suspend) {
    const schedule = cronjob.spec?.schedule;
    if (schedule) {
      // This is a simplification as proper cron parsing would be needed
      return 'Based on schedule';
    }
  }
  return cronjob.spec?.suspend ? 'Suspended' : 'Unknown';
};

// Helper function to get last schedule time
export const getLastSchedule = (cronjob: V1CronJob) => {
  if (cronjob.status?.lastScheduleTime) {
    return getAge(String(cronjob.status.lastScheduleTime));
  }
  return 'Never';
};
