import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { getDriveAssets } from "@/lib/googleSheets";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, MessageSquare, Loader2, Image as ImageIcon, Download } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink: string; // The download link
  thumbnailLink: string;  // The image preview
}

const AppHome = () => {
  const { client } = useAuth();
  const [assets, setAssets] = useState<DriveFile[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      if (client?.googleDrive) {
        setIsLoadingAssets(true);
        try {
          const result = await getDriveAssets(client.googleDrive);
          // Filter to only show image files (ignore PDFs or folders if any exist)
          const imageFiles = (result || []).filter((file: DriveFile) => file.mimeType.startsWith('image/'));
          setAssets(imageFiles);
        } catch (error) {
          console.error("Failed to load drive assets:", error);
        } finally {
          setIsLoadingAssets(false);
        }
      }
    }
    loadAssets();
  }, [client?.googleDrive]);

  return (
    <div className="space-y-10 max-w-6xl pb-10">
      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome to Brandify, {client?.firstName || client?.company || "User"}
          </h1>
          <p className="text-muted-foreground mt-1">Manage your branded marketing templates</p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex gap-4 shrink-0">
          <Link to="/app/templates" className="flex-1 md:flex-none">
            <Card className="border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer h-full">
              <CardContent className="flex items-center p-4 gap-3">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">My Templates</span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/app/contact" className="flex-1 md:flex-none">
            <Card className="border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer h-full">
              <CardContent className="flex items-center p-4 gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Support</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* GENERATED ASSETS GALLERY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> 
            My Generated Assets
          </h2>
          {client?.googleDrive && (
            <a 
              href={`https://drive.google.com/drive/folders/${client.googleDrive}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Open in Drive &rarr;
            </a>
          )}
        </div>

        {!client?.googleDrive ? (
          <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground">Your asset folder is currently being provisioned.</p>
          </div>
        ) : isLoadingAssets ? (
          <div className="flex flex-col items-center justify-center py-16 border border-border rounded-lg bg-card/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading your latest images...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border">
            <p className="text-muted-foreground">You haven't generated any assets yet. Go to 'My Templates' to start!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                {/* Use the Google Drive high-res thumbnail */}
                <img 
                  src={asset.thumbnailLink.replace('=s220', '=s800')} 
                  alt={asset.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Hover Overlay with Download Action */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-white text-xs font-medium truncate w-full mb-3 px-2">
                    {asset.name}
                  </p>
                  <a 
                    href={asset.webContentLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                    title="Download Image"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppHome;
