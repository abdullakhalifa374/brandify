import { Link, useLocation } from "react-router-dom";
import { Home, LayoutTemplate, Settings, Gift, BookOpen } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();

  // Cleaned up menu: Removed Marketplace and Free Templates
  const items = [
    { title: "Dashboard", url: "/app", icon: Home },
    { title: "My Templates", url: "/app/templates", icon: LayoutTemplate },
    { title: "Rewards", url: "/app/rewards", icon: Gift },
    { title: "Account", url: "/app/account", icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarContent className="pt-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="font-medium"
                  >
                    <Link to={item.url}>
                      <item.icon className="w-5 h-5 mr-1" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* NEW DESIGN: Custom Documentation Box */}
      <SidebarFooter className="p-4 mb-4">
        <Link to="https://docs.brandify.zone" target="_blank" className="block outline-none">
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
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
