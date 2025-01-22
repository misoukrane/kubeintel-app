import { Calendar, Boxes, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"

// Menu items.
const items = [
  {
    title: "cluster Info",
    url: "/cluster",
    icon: Boxes,
  },
  {
    title: "Pods",
    url: "/pods",
    icon: Inbox,
  },
  {
    title: "Deployments",
    url: "/deployments",
    icon: Calendar,
  },
  {
    title: "DaemonSets",
    url: "/daemonsets",
    icon: Search,
  },
  {
    title: "statefulSets",
    url: "/statefulsets",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
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
                          <span className={isActive ? "font-bold" : ""}>
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
    </Sidebar>
  )
}