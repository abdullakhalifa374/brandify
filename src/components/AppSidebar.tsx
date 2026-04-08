import { Home, LayoutGrid, User, MessageSquare, FolderOpen, LogOut, BookOpen, Gift, ShoppingCart } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, Link } from "react-router-dom";
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

const mobileOnlyItems = [
  { title: "Free Templates", url: "/free-templates", icon: LayoutGrid },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingCart },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { client, logout } = useAuth();

  const driveUrl = client?.googleDrive
    ? `https://drive.google.com/drive/folders/${client.googleDrive}`
    : "#";

  return (
    <Sidebar collapsible="icon" className="bg-white border-r border-[#E2E7F5]">
      <SidebarContent className="flex flex-col h-full bg-white">
        
        {/* THE TOP-LEFT LOGO CELL */}
        <div className="h-14 flex items-center justify-center border-b border-[#E2E7F5] px-2 shrink-0">
          <Link to="/" className="flex items-center justify-center w-full">
            {collapsed ? (
              <div className="w-8 h-8 bg-[#3933EB] rounded-md flex items-center justify-center text-white font-bold text-lg">B</div>
            ) : (
              <img 
                src="https://cloud-1de12d.becdn.net/media/iW=238&iH=54&oX=0&oY=0&cW=238&cH=54/3f67b33762851b549b689cda2577b6ca/Brandify-Logo.png" 
                alt="Brandify" 
                className="h-7 object-contain"
              />
            )}
          </Link>
        </div>

        {/* APPLICATION LINKS */}
        <SidebarGroup className="mt-4">
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

        {/* MOBILE-ONLY PUBLIC LINKS (Hidden on Desktop) */}
        <SidebarGroup className="sm:hidden mt-2">
          <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {!collapsed && "Public"}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {mobileOnlyItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="hover:bg-accent/50">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CENTERED DOCUMENTATION BOX */}
        <div className="flex-1 flex flex-col justify-center p-4">
          {collapsed ? (
            <a href="https://www.brandify.zone/documentation" target="_blank" rel="noopener noreferrer" title="Documentation" className="flex items-center justify-center p-2 rounded-xl bg-[#F0EFFC] text-[#3933EB] hover:bg-[#E2E0F9] transition-colors mx-auto">
              <BookOpen className="w-5 h-5" />
            </a>
          ) : (
            <a href="https://www.brandify.zone/documentation" target="_blank" rel="noopener noreferrer" className="block outline-none w-full">
              <div className="bg-[#F0EFFC] border border-[#C5C5F9] rounded-xl p-4 transition-all hover:bg-[#E2E0F9] hover:shadow-sm flex flex-col items-center text-center gap-2">
                <BookOpen className="w-8 h-8 text-[#3933EB] shrink-0 mb-1" />
                <span className="text-[#3933EB] font-bold leading-tight text-sm">Documentation Overview</span>
                <p className="text-xs text-[#6B7280] font-medium leading-relaxed">
                  Step-by-step instructions for forms, templates, and more.
                </p>
              </div>
            </a>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 pb-6 bg-white">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
