import { Home, LayoutGrid, User, MessageSquare, FolderOpen, LogOut, BookOpen, Gift } from "lucide-react";
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

const navItems = [
  { title: "Home", url: "/app", icon: Home },
  { title: "My Templates", url: "/app/templates", icon: LayoutGrid },
  { title: "Rewards", url: "/app/rewards", icon: Gift }, 
  { title: "Account", url: "/app/account", icon: User },
  { title: "Contact Us", url: "/app/contact", icon: MessageSquare },
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
        <div className="p-4 h-14 flex items-center">
          {!collapsed && (
            <span className="text-xl font-bold text-foreground tracking-tight">Brandify</span>
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
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-3">
        {/* CUSTOM DOCUMENTATION BOX */}
        {collapsed ? (
          <a href="https://www.brandify.zone/documentation" target="_blank" rel="noopener noreferrer" title="Documentation" className="flex items-center justify-center p-2 rounded-xl bg-[#F0EFFC] text-[#3933EB] hover:bg-[#E2E0F9] transition-colors">
            <BookOpen className="w-5 h-5" />
          </a>
        ) : (
          <a href="https://www.brandify.zone/documentation" target="_blank" rel="noopener noreferrer" className="block outline-none">
            <div className="bg-[#F0EFFC] border border-[#C5C5F9] rounded-xl p-4 transition-all hover:bg-[#E2E0F9] hover:shadow-sm">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#3933EB] font-bold">
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <span className="leading-tight">Documentation Overview</span>
                </div>
                <p className="text-xs text-[#6B7280] font-medium leading-relaxed">
                  Step-by-step instructions for forms, templates, and more.
                </p>
              </div>
            </div>
          </a>
        )}

        {/* LOGOUT BUTTON */}
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
