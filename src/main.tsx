import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { KubeconfigFilePicker } from '@/pages/kubeconfig-file-picker';
import './global.css';
import Layout from './layout';
import { Cluster } from './pages/cluster';
import { Pods } from './pages/pods';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ROUTES } from '@/lib/routes';
import { Deployments } from './pages/deployments';
import { NotFound } from '@/pages/not-found';
import { DaemonSets } from './pages/daemonsets';
import { StatefulSets } from './pages/statefulsets';
import { Pod } from './pages/pod';
import { Deployment } from './pages/deployment';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DaemonSet } from './pages/daemonset';
import { StatefulSet } from './pages/statefulset';
import { Nodes } from './pages/nodes';
import { Node } from './pages/node';
import { NodePods } from './pages/node-pods';
import { AIConfigPage } from './pages/ai-config';
import { Jobs } from './pages/jobs';
import { Job } from './pages/job';
import { ErrorBoundary } from './components/error-boundary';
import { CronJobs } from './pages/cronjobs';
import { CronJob } from './pages/cronjob';
import { ConfigMaps } from './pages/configmaps';
import { ConfigMap } from './pages/configmap';
import { Secrets } from './pages/secrets';
import { Secret } from './pages/secret';
import { Services } from './pages/services';
import { Service } from './pages/service';

const queryClient = new QueryClient();

// Create router with proper error boundaries
const router = createBrowserRouter([
  {
    path: '/',
    element: <KubeconfigFilePicker />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: ROUTES.CLUSTER,
        element: <Cluster />,
      },
      {
        path: ROUTES.AI_CONFIG,
        element: <AIConfigPage />,
      },
      {
        path: ROUTES.PODS,
        element: <Pods />,
      },
      {
        path: ROUTES.DEPLOYMENTS,
        element: <Deployments />,
      },
      {
        path: ROUTES.DAEMONSETS,
        element: <DaemonSets />,
      },
      {
        path: ROUTES.STATEFULSETS,
        element: <StatefulSets />,
      },
      {
        path: ROUTES.POD,
        element: <Pod />,
      },
      {
        path: ROUTES.DEPLOYMENT,
        element: <Deployment />,
      },
      {
        path: ROUTES.DAEMONSET,
        element: <DaemonSet />,
      },
      {
        path: ROUTES.STATEFULSET,
        element: <StatefulSet />,
      },
      {
        path: ROUTES.NODES,
        element: <Nodes />,
      },
      {
        path: ROUTES.NODE,
        element: <Node />,
      },
      {
        path: ROUTES.NODE_PODS,
        element: <NodePods />,
      },
      {
        path: ROUTES.JOBS,
        element: <Jobs />,
      },
      {
        path: ROUTES.JOB,
        element: <Job />,
      },
      {
        path: ROUTES.CRONJOBS,
        element: <CronJobs />,
      },
      {
        path: ROUTES.CRONJOB,
        element: <CronJob />,
      },
      {
        path: ROUTES.CONFIGMAPS,
        element: <ConfigMaps />,
      },
      {
        path: ROUTES.CONFIGMAP,
        element: <ConfigMap />,
      },
      {
        path: ROUTES.SECRETS,
        element: <Secrets />,
      },
      {
        path: ROUTES.SECRET,
        element: <Secret />,
      },
      {
        path: ROUTES.SERVICES,
        element: <Services />,
      },
      {
        path: ROUTES.SERVICE,
        element: <Service />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <ErrorBoundary />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
