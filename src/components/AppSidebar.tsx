import { Home, LayoutGrid, User, MessageSquare, FolderOpen, LogOut, ShoppingCart, PlayCircle, BookOpen, Gift } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

// NEW: Added Rewards to the navItems array
const navItems = [
  { title: "Home", url: "/app", icon: Home },
  { title: "My Templates", url: "/app/templates", icon: LayoutGrid },
  { title: "Rewards", url: "/app/rewards", icon: Gift }, 
  { title: "Account", url: "/app/account", icon: User },
  { title: "Contact Us", url: "/app/contact", icon: MessageSquare },
];

const resourceItems = [
  { title: "Marketplace", url: "/marketplace", icon: ShoppingCart, external: false },
  { title: "Demo", url: "/demo", icon: PlayCircle, external: false },
  { title: "Documentation", url: "https://www.brandify.zone/documentation", icon: BookOpen, external: true },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { client, logout } = useAuth();

  const driveUrl = client?.googleDrive
    ? `https://drive.google.com/drive/folders/${client.googleDrive}`
    : "#";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          {!collapsed && (
            <span className="text-lg font-bold text-foreground tracking-tight">Brandify</span>
          )}
        </div>

        {/* MAIN APPLICATION LINKS */}
        <SidebarGroup>
          <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {!collapsed && "Application"}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/app"}
                      className="hover:bg-accent/50"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:bg-accent/50 px-2 py-1.5 rounded-md text-sm">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Google Drive</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* RESOURCES LINKS */}
        <SidebarGroup className="mt-4">
          <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {!collapsed && "Resources"}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    {item.external ? (
                       <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:bg-accent/50 text-muted-foreground px-2 py-1.5 rounded-md text-sm">
                         <item.icon className="mr-2 h-4 w-4" />
                         {!collapsed && <span>{item.title}</span>}
                       </a>
                    ) : (
                       <NavLink to={item.url} className="hover:bg-accent/50 text-muted-foreground px-2 py-1.5 rounded-md text-sm" activeClassName="bg-accent text-primary font-medium">
                         <item.icon className="mr-2 h-4 w-4" />
                         {!collapsed && <span>{item.title}</span>}
                       </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter className="p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
