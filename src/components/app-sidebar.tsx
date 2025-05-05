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
import { NavLink } from 'react-router'; // Correct import for NavLink
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
import { SvcLogo } from '@/assets/svc'; // Assuming you have a ServiceLogo
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'; // Import Collapsible components
import { ChevronDown } from 'lucide-react'; // Import an icon for the trigger

interface MenuItem {
  title: string;
  url: string | ((namespace?: string) => string);
  icon: React.ComponentType<any>;
  requiresNamespace?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

// Define menu items grouped by category
const menuGroups: MenuGroup[] = [
  {
    title: 'Cluster',
    items: [
      {
        title: 'Info',
        url: ROUTES.CLUSTER,
        icon: ControlPlaneLogo,
      },
      {
        title: 'Nodes',
        url: ROUTES.NODES,
        icon: NodeLogo,
      },
    ],
  },
  {
    title: 'Workloads',
    items: [
      {
        title: 'Pods',
        url: ROUTES.PODS,
        icon: PodLogo,
        requiresNamespace: true,
      },
      {
        title: 'Deployments',
        url: ROUTES.DEPLOYMENTS,
        icon: DeployLogo,
        requiresNamespace: true,
      },
      {
        title: 'DaemonSets',
        url: ROUTES.DAEMONSETS,
        icon: DsLogo,
        requiresNamespace: true,
      },
      {
        title: 'StatefulSets',
        url: ROUTES.STATEFULSETS,
        icon: StsLogo,
        requiresNamespace: true,
      },
      {
        title: 'Jobs',
        url: ROUTES.JOBS,
        icon: JobLogo,
        requiresNamespace: true,
      },
      {
        title: 'CronJobs',
        url: ROUTES.CRONJOBS,
        icon: CronJobLogo,
        requiresNamespace: true,
      },
    ],
  },
  {
    title: 'Networking',
    items: [
      {
        title: 'Services',
        url: ROUTES.SERVICES,
        icon: SvcLogo, // Use the imported ServiceLogo
        requiresNamespace: true,
      },
      // Add Ingress, NetworkPolicy etc. here later
    ],
  },
  {
    title: 'Storage',
    items: [
      {
        title: 'Volumes',
        url: ROUTES.PERSISTENT_VOLUMES,
        icon: PersistentVolumeLogo,
      },
      {
        title: 'Volume Claims',
        url: ROUTES.PERSISTENT_VOLUME_CLAIMS, // Use the constant
        icon: PersistentVolumeClaimLogo,
        requiresNamespace: true,
      },
    ],
  },
  {
    title: 'Configuration',
    items: [
      {
        title: 'ConfigMaps',
        url: ROUTES.CONFIGMAPS,
        icon: CmLogo,
        requiresNamespace: true,
      },
      {
        title: 'Secrets',
        url: ROUTES.SECRETS,
        icon: SecretLogo,
        requiresNamespace: true,
      },
    ],
  },
  {
    title: 'RBAC',
    items: [
      {
        title: 'ServiceAccounts',
        url: ROUTES.SERVICEACCOUNTS,
        icon: ServiceAccountLogo,
        requiresNamespace: true,
      },
      {
        title: 'Roles',
        url: ROUTES.ROLES,
        icon: RoleLogo,
        requiresNamespace: true,
      },
      {
        title: 'RoleBindings',
        url: ROUTES.ROLEBINDINGS,
        icon: RoleBindingLogo,
        requiresNamespace: true,
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
    ],
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
        {menuGroups.map((group) => (
          <Collapsible
            key={group.title}
            defaultOpen={
              group.title === 'Cluster' || group.title === 'Workloads'
            } // Set defaultOpen conditionally
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center w-full">
                  {group.title}
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
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
                            <NavLink
                              to={itemUrl}
                              className={({ isActive }) =>
                                isActive ? 'font-bold' : ''
                              } // Apply active styles via className prop
                            >
                              {({ isActive }) => (
                                <>
                                  <item.icon
                                    className="transition-all duration-250 ease-in-out transform mr-2" // Added margin-right
                                    style={{
                                      width:
                                        isActive && open
                                          ? '1.75rem'
                                          : '1.25rem', // Adjusted sizes slightly
                                      height:
                                        isActive && open
                                          ? '1.75rem'
                                          : '1.25rem',
                                    }}
                                  />
                                  {open && <span>{item.title}</span>}{' '}
                                  {/* Conditionally render text */}
                                </>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
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
