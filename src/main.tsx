import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { KubeconfigFilePicker } from "@/pages/kubeconfig-file-picker";
import "./global.css";
import Layout from "./layout";
import { Cluster } from "./pages/cluster";
import { Pods } from "./pages/pods";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { ROUTES } from "@/lib/routes";
import { Deployments } from "./pages/deployments";
import { NotFound } from "@/pages/not-found";
import { DaemonSets } from "./pages/daemonsets";
import { StatefulSets } from "./pages/statefulsets";
import { Pod } from "./pages/pod";
import { Deployment } from "./pages/deployment";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DaemonSet } from "./pages/daemonset";
import { StatefulSet } from "./pages/statefulset";
import { Nodes } from "./pages/nodes";
import { Node } from "./pages/node";
import { NodePods } from "./pages/node-pods";
import { AIConfigPage } from "./pages/ai-config";

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<KubeconfigFilePicker />} />
            <Route element={<Layout />} >
              <Route path="/cluster" element={<Cluster />} />
              <Route path={ROUTES.AI_CONFIG} element={<AIConfigPage />} />
              <Route path={ROUTES.PODS} element={<Pods />} />
              <Route path={ROUTES.DEPLOYMENTS} element={<Deployments />} />
              <Route path={ROUTES.DAEMONSETS} element={<DaemonSets />} />
              <Route path={ROUTES.STATEFULSETS} element={<StatefulSets />} />
              <Route path={ROUTES.POD} element={<Pod />} />
              <Route path={ROUTES.DEPLOYMENT} element={<Deployment />} />
              <Route path={ROUTES.DAEMONSET} element={<DaemonSet />} />
              <Route path={ROUTES.STATEFULSET} element={<StatefulSet />} />
              <Route path={ROUTES.NODES} element={<Nodes />} />
              <Route path={ROUTES.NODE} element={<Node />} />
              <Route path={ROUTES.NODE_PODS} element={<NodePods />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
