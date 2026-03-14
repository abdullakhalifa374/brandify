import { Outlet } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
