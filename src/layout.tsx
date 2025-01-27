import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useNavigate, Outlet } from "react-router";
import { useConfigStore } from "@/stores/use-config-store";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { exit, relaunch } from '@tauri-apps/plugin-process';



export default function Layout() {
  const navigate = useNavigate();
  const cfgState = useConfigStore();
  const [contexts, setContexts] = useState<Array<string>>([]);
  const [currentContext, setCurrentContext] = useState<string>('');


  useEffect(() => {
    const readConfig = async () => {
      // use tauri to read the kubeconfig file
      const filePath = cfgState.selectedKubeconfig
      if (!filePath || filePath.length === 0) {
        return;
      }
      try {
        // tauri invoke command read_kubeconfig
        const content = await invoke<any>('read_kubeconfig', { kubeconfigPath: filePath });
        setContexts(content.contexts.map((ctx: any) => ctx.name));
        setCurrentContext(content['current-context']);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    };
    readConfig();
  }, [cfgState.selectedKubeconfig]);


  return (
    <SidebarProvider>
      <AppSidebar
        contexts={contexts}
        currentContext={currentContext}
        onContextChange={(context) => {
          setCurrentContext(context);
        }}

        onKubeconfigChange={() => {
          cfgState.setSelectedKubeconfig('');
          setContexts([]);
          setCurrentContext('');
          navigate('/');
        }}
        onAIConfig={() => {
          navigate('/config/ai');
        }}
        onQuit={async () => {
          await exit(0);
        }}
        onRelaunch={async () => {
          await relaunch();
        }}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <SidebarTrigger />
        <Outlet />
      </main>
    </SidebarProvider>
  )
}