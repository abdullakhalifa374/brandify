import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateClientProfile } from "@/lib/googleSheets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, Link2, Mail, Phone, ExternalLink, Edit2, Save, Loader2, UploadCloud } from "lucide-react";

const AppAccount = () => {
  const { client, reminders } = useAuth();
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    website: "",
    socialMedia: "",
    supportPhone: "",
    supportEmail: ""
  });

  // Logo Upload State
  const [isUploadingLogo, setIsUploadingLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetLogoCol, setTargetLogoCol] = useState<string>("");

  if (!client) return null;

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        website: client.website || "",
        socialMedia: client.socialMedia || "",
        supportPhone: client.supportPhone || "",
        supportEmail: client.supportEmail || ""
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateClientProfile(client.mobile, editForm);
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to save profile. Please try again.");
      setIsSaving(false);
    }
  };

  // Trigger file selection window
  const triggerLogoUpload = (columnName: string) => {
    setTargetLogoCol(columnName);
    fileInputRef.current?.click();
  };

  // Convert file to Base64 and send to Netlify
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) { 
      alert("File is too large. Please select an image under 3MB.");
      return;
    }

    setIsUploadingLogo(targetLogoCol);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = reader.result?.toString().split(',')[1];
      
      try {
        const response = await fetch('/.netlify/functions/google-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'uploadLogo',
            mobile: client.mobile,
            data: {
              fileName: `${client.company.replace(/\s+/g, '_')}_${targetLogoCol}`,
              mimeType: file.type,
              base64: base64Data,
              columnName: targetLogoCol // "darkLogo", "lightLogo", or "coloredLogo"
            }
          })
        });

        if (!response.ok) throw new Error("Failed to upload logo");
        window.location.reload();

      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload logo. Please try again.");
      } finally {
        setIsUploadingLogo(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
  };

  const renderLogo = (rawUrl: string, label: string, columnKey: string) => {
    const isCurrentlyUploading = isUploadingLogo === columnKey;
    
    // Feature Request: Make Light Logo background darker so white logos are visible
    const bgClass = columnKey === "lightLogo" ? "bg-slate-800 border-slate-700" : "bg-muted/20 border-border";
    const textClass = columnKey === "lightLogo" ? "text-slate-300" : "text-muted-foreground";

    let content;
    if (!rawUrl || rawUrl.trim() === "") {
      content = (
        <div className={`flex flex-col items-center justify-center gap-2 p-3 border border-dashed rounded-md h-28 w-full group relative ${bgClass}`}>
           <span className={`text-xs group-hover:opacity-0 transition-opacity ${textClass}`}>Not provided</span>
           <span className={`text-[10px] font-medium uppercase group-hover:opacity-0 transition-opacity ${textClass}`}>{label}</span>
           <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-background/80 transition-opacity rounded-md">
              <UploadCloud className="w-5 h-5 text-primary mb-1" />
              <span className="text-[10px] font-semibold text-primary">Upload</span>
           </div>
        </div>
      );
    } else {
      const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = match ? match[1] : rawUrl;
      const formattedUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

      content = (
        <div className={`flex flex-col items-center gap-2 p-3 border rounded-md hover:border-primary/50 transition-all group h-28 w-full relative overflow-hidden cursor-pointer ${bgClass}`}>
          <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden rounded-sm group-hover:opacity-20 transition-opacity">
            <img 
              src={formattedUrl} alt={label} 
              className="max-h-12 max-w-full object-contain drop-shadow-sm"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('bg-muted'); }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-auto group-hover:opacity-0 transition-opacity">
            <ExternalLink className={`w-3 h-3 ${textClass}`} />
            <span className={`text-xs font-medium ${textClass}`}>{label}</span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-background/80 transition-opacity rounded-md">
            <UploadCloud className="w-5 h-5 text-primary mb-1" />
            <span className="text-[10px] font-semibold text-primary">Replace Logo</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <button 
          onClick={() => triggerLogoUpload(columnKey)} 
          disabled={isUploadingLogo !== null}
          className="w-full text-left focus:outline-none rounded-md"
        >
          {content}
        </button>
        {isCurrentlyUploading && (
          <div className="absolute inset-0 bg-background/90 z-10 flex flex-col items-center justify-center rounded-md border border-primary">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <span className="text-[10px] font-medium text-primary">Uploading...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      {/* Hidden file input for logo uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/webp, image/svg+xml" 
        className="hidden" 
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Information</h1>
        <p className="text-muted-foreground">Manage your profile, billing, and brand settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contact Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Company Name</span>
                    <p className="font-medium">{client.company || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Status</span>
                    <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status || "Pending"}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Full Name</span>
                    <p className="font-medium">{client.firstName} {client.lastName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Login Email</span>
                    <p className="font-medium">{client.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Mobile</span>
                    <p className="font-medium">{client.mobile}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Public Business Details</CardTitle>
                <CardDescription>Information used on your marketing assets.</CardDescription>
              </div>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleEditToggle}><Edit2 className="w-4 h-4 mr-2"/> Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleEditToggle} disabled={isSaving}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-20 shrink-0">Website:</span>
                  {isEditing ? <Input value={editForm.website} onChange={e => setEditForm({...editForm, website: e.target.value})} className="h-8" /> : <span className="font-medium">{client.website || "N/A"}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-20 shrink-0">Support:</span>
                  {isEditing ? <Input value={editForm.supportPhone} onChange={e => setEditForm({...editForm, supportPhone: e.target.value})} className="h-8" /> : <span className="font-medium">{client.supportPhone || "N/A"}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-20 shrink-0">Email:</span>
                  {isEditing ? <Input type="email" value={editForm.supportEmail} onChange={e => setEditForm({...editForm, supportEmail: e.target.value})} className="h-8" /> : <span className="font-medium">{client.supportEmail || "N/A"}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg w-4 text-center shrink-0">@</span>
                  <span className="text-muted-foreground w-20 shrink-0">Social:</span>
                  {isEditing ? <Input value={editForm.socialMedia} onChange={e => setEditForm({...editForm, socialMedia: e.target.value})} placeholder="@username" className="h-8" /> : <span className="font-medium">{client.socialMedia || "N/A"}</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Brand Assets (Logos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {renderLogo(client.darkLogo, "Dark Logo", "darkLogo")}
                {renderLogo(client.lightLogo, "Light Logo", "lightLogo")}
                {renderLogo(client.coloredLogo, "Colored Logo", "coloredLogo")}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-primary">Current Plan: {client.plan || "Free Trial"}</CardTitle>
                  <CardDescription>Max Credits: {client.maxCredits || client.credit}</CardDescription>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Expires: {client.endDate || "N/A"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-background p-4 border border-border shadow-sm">
                  <p className="text-2xl font-bold">{client.credit}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Limit</p>
                </div>
                <div className="rounded-lg bg-background p-4 border border-border shadow-sm">
                  <p className="text-2xl font-bold">{client.used}</p>
                  <p className="text-xs text-muted-foreground mt-1">Used</p>
                </div>
                <div className="rounded-lg bg-primary text-primary-foreground p-4 shadow-sm">
                  <p className="text-2xl font-bold">{client.remaining}</p>
                  <p className="text-xs opacity-90 mt-1">Available</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center text-sm border-t border-primary/10 pt-4">
                <span className="text-muted-foreground">Free Templates Claimed:</span>
                <span className="font-bold">{client.templatesUsed} / {client.freeTemplates}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Upcoming Reminders & Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No active reminders.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-md border border-border bg-card">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm capitalize">{r.type.replace("-", " ")}</span>
                          <Badge variant={r.status.toLowerCase() === "pending" ? "secondary" : "default"} className="text-[10px] h-5">
                            {r.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Target Plan: {r.plan}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{r.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppAccount;
