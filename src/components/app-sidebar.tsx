import { Calendar, Boxes, Inbox, Search, Settings } from 'lucide-react';

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

// Menu items.
const items = [
  {
    title: 'cluster Info',
    url: '/cluster',
    icon: Boxes,
  },
  {
    title: 'Pods',
    url: '/pods',
    icon: Inbox,
  },
  {
    title: 'Deployments',
    url: '/deployments',
    icon: Calendar,
  },
  {
    title: 'DaemonSets',
    url: '/daemonsets',
    icon: Search,
  },
  {
    title: 'statefulSets',
    url: '/statefulsets',
    icon: Settings,
  },
];

interface AppSidebarProps {
  contexts: string[];
  currentContext?: string;
  onContextChange: (context: string) => void;
  onKubeconfigChange: () => void;
  onAIConfig: () => void;
  onQuit: () => void;
  onRelaunch: () => void;
}

export function AppSidebar(props: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ContextSwitcher
          contexts={props.contexts}
          currentContext={props.currentContext}
          onContextChange={props.onContextChange}
          onKubeconfigChange={props.onKubeconfigChange}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url}>
                      {({ isActive }) => (
                        <>
                          <item.icon
                            strokeWidth={isActive ? 3 : 2}
                            size={isActive ? 36 : 24}
                          />
                          <span className={isActive ? 'font-bold' : ''}>
                            {item.title}
                          </span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
