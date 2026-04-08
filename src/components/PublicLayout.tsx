import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      <PublicNavbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
