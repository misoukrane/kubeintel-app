import { ATTACHEMENT_NAMES } from './types';

export const truncate = (str: string, length: number = 56) =>
  str.length > length ? `${str.substring(0, length)}...` : str;

export const createLabelSelector = (matchLabels?: Record<string, string>) => {
  return matchLabels
    ? Object.entries(matchLabels)
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
    : '';
};

export const getAttachemntLogName = (containerName: string) => {
  return `${containerName}-${ATTACHEMENT_NAMES.POD_LOGS}`;
};

export enum ResourceTypes {
  Pod = 'Pod',
  Deployment = 'Deployment',
  DaemonSet = 'DaemonSet',
  StatefulSet = 'StatefulSet',
  Job = 'Job',
  CronJob = 'CronJob',
  Node = 'Node',
}
