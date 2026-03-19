import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateClientProfile } from "@/lib/googleSheets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, Link2, Mail, Phone, ExternalLink, Edit2, Save, Loader2, ImagePlus } from "lucide-react";

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

  if (!client) return null;

  // Dynamically build the external form URL with the user's data
  const updateLogosUrl = `https://forms.brandify.zone/update-information/?mobile=${encodeURIComponent(client.mobile)}&email=${encodeURIComponent(client.email)}`;

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

  const renderLogo = (rawUrl: string, label: string, columnKey: string) => {
    // Feature Request: Make Light Logo background darker so white logos are visible
    const bgClass = columnKey === "lightLogo" ? "bg-slate-800 border-slate-700" : "bg-muted/20 border-border";
    const textClass = columnKey === "lightLogo" ? "text-slate-300" : "text-muted-foreground";

    if (!rawUrl || rawUrl.trim() === "") {
      return (
        <div className={`flex flex-col items-center justify-center gap-2 p-3 border border-dashed rounded-md h-28 w-full ${bgClass}`}>
           <span className={`text-xs ${textClass}`}>Not provided</span>
           <span className={`text-[10px] font-medium uppercase ${textClass}`}>{label}</span>
        </div>
      );
    } 

    const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    const fileId = match ? match[1] : rawUrl;
    const formattedUrl = `http://googleusercontent.com/profile/picture/${fileId}`;

    return (
      <div className={`flex flex-col items-center gap-2 p-3 border rounded-md h-28 w-full relative overflow-hidden ${bgClass}`}>
        <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden rounded-sm">
          <img 
            src={formattedUrl} alt={label} 
            className="max-h-12 max-w-full object-contain drop-shadow-sm"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('bg-muted'); }}
          />
        </div>
        <div className="flex items-center gap-1.5 mt-auto">
          <span className={`text-[10px] font-medium uppercase ${textClass}`}>{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl pb-10">
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
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Brand Assets (Logos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {renderLogo(client.darkLogo, "Dark Logo", "darkLogo")}
                {renderLogo(client.lightLogo, "Light Logo", "lightLogo")}
                {renderLogo(client.coloredLogo, "Colored Logo", "coloredLogo")}
              </div>
              
              {/* EXTERNAL UPDATE FORM BUTTON */}
              <div className="flex justify-end border-t border-border pt-4">
                <Button asChild variant="outline" size="sm" className="w-full md:w-auto hover:bg-primary/5">
                  <a href={updateLogosUrl} target="_blank" rel="noopener noreferrer">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Replace Logos
                  </a>
                </Button>
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
