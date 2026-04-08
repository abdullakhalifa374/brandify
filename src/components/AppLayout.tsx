import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import PublicNavbar from "./PublicNavbar";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* 1. Global Top Navigation Bar (Forced 100% Width) */}
      <div className="w-full z-50">
        <PublicNavbar />
      </div>

      {/* 2. Dashboard Workspace */}
      <SidebarProvider>
        <div className="flex flex-1 w-full overflow-hidden">
          <AppSidebar />
          <main className="flex-1 bg-muted/20 p-4 md:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AppLayout;
