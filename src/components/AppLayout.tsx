import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar"; // <-- FIXED IMPORT (Removed curly braces)
import PublicNavbar from "./PublicNavbar";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Global Top Navigation Bar */}
      <div className="z-50">
        <PublicNavbar />
      </div>

      {/* 2. Dashboard Workspace (Sidebar + Main Content) */}
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
          <AppSidebar />
          <main className="flex-1 bg-muted/20 p-4 md:p-6 overflow-y-auto">
            <SidebarTrigger className="md:hidden mb-4" />
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AppLayout;
