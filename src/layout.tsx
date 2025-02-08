import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useNavigate, Outlet, useLocation } from "react-router";
import { useConfigStore } from "@/stores/use-config-store";
import { useEffect } from "react";
import { ROUTES } from "@/lib/routes";
import { quitApp, relaunchApp } from "@/lib/app-actions";
import { useToast } from "@/hooks/use-toast"
import { MainNavigation } from "@/components/upper-navigation";


export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const {
    selectedKubeconfig,
    contexts,
    currentContext,
    namespaces,
    currentNamespace,
    loadKubeconfig,
    setCurrentContext,
    setSelectedKubeconfig,
    setCurrentNamespace,
    loadNamespaces,
  } = useConfigStore();

  // Handle kubeconfig loading and errors
  useEffect(() => {
    const load = async () => {
      if (!selectedKubeconfig) return;
      try {
        await loadKubeconfig(selectedKubeconfig);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading kubeconfig",
          description: error instanceof Error ? error.message : JSON.stringify(error)
        });
      }
    };

    load();
  }, [selectedKubeconfig, loadKubeconfig, toast]);

  // Handle loading namespaces and errors
  const loadNs = async (selectedKubeconfig?: string, currentContext?: string) => {
    try {
      await loadNamespaces(selectedKubeconfig, currentContext);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading namespaces",
        description: error instanceof Error ? error.message : JSON.stringify(error)
      });
    }
  };

  useEffect(() => {
    loadNs(selectedKubeconfig, currentContext);
  }, [selectedKubeconfig, currentContext, loadNamespaces, toast]);

  return (
    <SidebarProvider>
      <AppSidebar
        contexts={contexts}
        currentContext={currentContext}
        namespaces={namespaces}
        currentNamespace={currentNamespace}
        onContextChange={setCurrentContext}
        onKubeconfigChange={() => {
          setSelectedKubeconfig('');
          navigate(ROUTES.HOME);
        }}
        onNamespaceChange={(namespace) => {
          setCurrentNamespace(namespace);
        }}
        onReloadNamespaces={() => loadNs(selectedKubeconfig, currentContext)}
        onAIConfig={() => navigate(ROUTES.AI_CONFIG)}
        onQuit={quitApp}
        onRelaunch={relaunchApp}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-4">
          <SidebarTrigger />
          <div data-orientation="vertical" role="none" className="shrink-0 bg-border w-[1px] mr-2 h-4"></div>
          <MainNavigation location={location.pathname} />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}