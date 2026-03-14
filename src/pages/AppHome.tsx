import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, FolderOpen, MessageSquare } from "lucide-react";

const AppHome = () => {
  const { client } = useAuth();
  const driveUrl = client?.googleDrive
    ? `https://drive.google.com/drive/folders/${client.googleDrive}`
    : "#";

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to Brandify, {client?.firstName}</h1>
        <p className="text-muted-foreground mt-1">Manage your branded marketing templates</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/app/templates">
          <Card className="h-full border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <LayoutGrid className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">My Templates</h3>
                <p className="text-xs text-muted-foreground mt-1">Access your marketing templates</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <a href={driveUrl} target="_blank" rel="noopener noreferrer">
          <Card className="h-full border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <FolderOpen className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Google Drive</h3>
                <p className="text-xs text-muted-foreground mt-1">View your generated images</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <Link to="/app/contact">
          <Card className="h-full border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-3">
              <MessageSquare className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Support</h3>
                <p className="text-xs text-muted-foreground mt-1">Get help from our team</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AppHome;
