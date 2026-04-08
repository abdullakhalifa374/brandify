import { Outlet, Link, useLocation } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppHeader = () => {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <header className="flex h-14 items-center justify-between px-4 bg-white border-b border-[#E2E7F5] shrink-0">
      <div className="flex items-center gap-3">
        {/* Sidebar Minimize Trigger */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-[#8A94A6] hover:text-[#000000] h-8 w-8"
        >
          {collapsed || isMobile ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </Button>
        
        {/* MOBILE ONLY LOGO */}
        <div className="md:hidden flex items-center">
           <img 
             src="https://cloud-1de12d.becdn.net/media/iW=238&iH=54&oX=0&oY=0&cW=238&cH=54/3f67b33762851b549b689cda2577b6ca/Brandify-Logo.png" 
             alt="Brandify" 
             className="h-6 object-contain" 
            />
        </div>
      </div>

      <nav className="flex items-center gap-1 md:gap-2">
        <Link to="/free-templates" className="hidden sm:block">
          <Button variant={location.pathname === "/free-templates" ? "secondary" : "ghost"} size="sm">
            Free Templates
          </Button>
        </Link>
        <Link to="/marketplace" className="hidden sm:block">
          <Button variant={location.pathname === "/marketplace" ? "secondary" : "ghost"} size="sm">
            Marketplace
          </Button>
        </Link>
        <Link to="/app">
          <Button size="sm">Dashboard</Button>
        </Link>
      </nav>
    </header>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F7F8FC]">
        {/* Left Column */}
        <AppSidebar />
        
        {/* Right Column */}
        <div className="flex flex-col flex-1 min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">
            {/* EDIT 4: Centered App Content with Matching Max Width */}
            <div className="container mx-auto p-4 md:p-6 lg:max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
