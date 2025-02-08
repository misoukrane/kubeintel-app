export const ROUTES = {
  HOME: '/',
  CLUSTER: '/cluster',
  PODS: '/pods',
  DEPLOYMENTS: '/deployments',
  DAEMONSETS: '/daemonsets',
  AI_CONFIG: '/config/ai',
  STATEFULSETS: '/statefulsets',
  POD: '/pods/:podName',
  DEPLOYMENT: '/deployments/:deploymentName',
  DAEMONSET: '/daemonsets/:daemonSetName',
} as const;
