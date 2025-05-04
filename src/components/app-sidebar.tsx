import { useSidebar } from '@/components/ui/sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavLink } from 'react-router';
import { ContextSwitcher } from './context-switcher';
import { NavSettings } from './nav-settings';
import { NamespaceSwitcher } from './namespace-switcher';
import { PodLogo } from '@/assets/pod';
import { DeployLogo } from '@/assets/deploy';
import { DsLogo } from '@/assets/ds';
import { StsLogo } from '@/assets/sts';
import { ControlPlaneLogo } from '@/assets/control-plane';
import { NodeLogo } from '@/assets/node';
import { JobLogo } from '@/assets/job';
import { CmLogo } from '@/assets/cm';
import { SecretLogo } from '@/assets/secret';
import { CronJobLogo } from '@/assets/cron-job';
import { ServiceAccountLogo } from '@/assets/service-account';
import { RoleLogo } from '@/assets/role';
import { RoleBindingLogo } from '@/assets/role-binding';
import { ClusterRoleLogo } from '@/assets/cluster-role';
import { ClusterRoleBindingLogo } from '@/assets/cluster-role-binding';
import { PersistentVolumeLogo } from '@/assets/persistent-volume';
import { PersistentVolumeClaimLogo } from '@/assets/persistent-volume-claim';
import { ROUTES } from '@/lib/routes';

interface MenuItem {
  title: string;
  url: string | ((namespace?: string) => string);
  icon: React.ComponentType<any>;
  requiresNamespace?: boolean;
}

// Menu items using ROUTES constants
const items: MenuItem[] = [
  {
    title: 'Cluster Info',
    url: ROUTES.CLUSTER,
    icon: ControlPlaneLogo,
  },
  {
    title: 'Pods',
    url: ROUTES.PODS,
    icon: PodLogo,
  },
  {
    title: 'Deployments',
    url: ROUTES.DEPLOYMENTS,
    icon: DeployLogo,
  },
  {
    title: 'DaemonSets',
    url: ROUTES.DAEMONSETS,
    icon: DsLogo,
  },
  {
    title: 'StatefulSets',
    url: ROUTES.STATEFULSETS,
    icon: StsLogo,
  },
  {
    title: 'Nodes',
    url: ROUTES.NODES,
    icon: NodeLogo,
  },
  {
    title: 'Jobs',
    url: ROUTES.JOBS,
    icon: JobLogo,
  },
  {
    title: 'CronJobs',
    url: ROUTES.CRONJOBS,
    icon: CronJobLogo,
  },
  {
    title: 'Services',
    url: ROUTES.SERVICES,
    icon: ControlPlaneLogo,
  },
  {
    title: 'ConfigMaps',
    url: ROUTES.CONFIGMAPS,
    icon: CmLogo,
  },
  {
    title: 'Volumes',
    url: ROUTES.PERSISTENT_VOLUMES,
    icon: PersistentVolumeLogo,
  },
  {
    title: 'Volume Claims',
    url: (namespace?: string) =>
      namespace
        ? `/namespaces/${namespace}/persistent-volume-claims`
        : '/persistent-volume-claims',
    icon: PersistentVolumeClaimLogo,
    requiresNamespace: true,
  },
  {
    title: 'Secrets',
    url: ROUTES.SECRETS,
    icon: SecretLogo,
  },
  {
    title: 'ServiceAccounts',
    url: ROUTES.SERVICEACCOUNTS,
    icon: ServiceAccountLogo,
  },
  {
    title: 'Roles',
    url: ROUTES.ROLES,
    icon: RoleLogo,
  },
  {
    title: 'RoleBindings',
    url: ROUTES.ROLEBINDINGS,
    icon: RoleBindingLogo,
  },
  {
    title: 'ClusterRoles',
    url: ROUTES.CLUSTER_ROLES,
    icon: ClusterRoleLogo,
  },
  {
    title: 'ClusterRoleBindings',
    url: ROUTES.CLUSTER_ROLE_BINDINGS,
    icon: ClusterRoleBindingLogo,
  },
];

interface AppSidebarProps {
  contexts: string[];
  currentContext?: string;
  namespaces: string[];
  currentNamespace?: string;
  onContextChange: (context: string) => void;
  onKubeconfigChange: () => void;
  onNamespaceChange: (namespace: string) => void;
  onReloadNamespaces: () => void;
  onAIConfig: () => void;
  onQuit: () => void;
  onRelaunch: () => void;
}

export function AppSidebar(props: AppSidebarProps) {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ContextSwitcher
          contexts={props.contexts}
          currentContext={props.currentContext}
          onContextChange={props.onContextChange}
          onKubeconfigChange={props.onKubeconfigChange}
        />
        <NamespaceSwitcher
          namespaces={props.namespaces}
          currentNamespace={props.currentNamespace}
          onNamespaceChange={props.onNamespaceChange}
          onReloadNamespaces={props.onReloadNamespaces}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Skip items that require namespace if none is selected
                if (item.requiresNamespace && !props.currentNamespace) {
                  return null;
                }

                const itemUrl =
                  typeof item.url === 'function'
                    ? item.url(props.currentNamespace)
                    : item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={itemUrl}>
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className="transition-all duration-250 ease-in-out transform"
                              style={{
                                width: isActive && open ? '2rem' : '1.5rem',
                                height: isActive && open ? '2rem' : '1.5rem',
                              }}
                            />
                            <span className={isActive ? 'font-bold ' : ''}>
                              {item.title}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavSettings
          onKubeconfigChange={props.onKubeconfigChange}
          onAIConfig={props.onAIConfig}
          onQuit={props.onQuit}
          onRelaunch={props.onRelaunch}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
