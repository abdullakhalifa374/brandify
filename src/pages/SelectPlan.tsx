import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { createClientAccount } from "@/lib/googleSheets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Zap, Loader2 } from "lucide-react";

const SelectPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const signupEmail = location.state?.signupEmail || user?.email;

  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", company: "" });

  if (!signupEmail) return <Navigate to="/signup" />;

  // Triggered when clicking a plan button
  const handleSelectPlan = (planName: string, credits: string, freeTemplates: string) => {
    setSelectedPlanDetails({ planName, credits, freeTemplates });
    setShowFormModal(true);
  };

  // Triggered when submitting the final form inside the modal
  const handleFinalizeAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createClientAccount(signupEmail, formData.phone, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        planName: selectedPlanDetails.planName,
        credits: selectedPlanDetails.credits,
        freeTemplates: selectedPlanDetails.freeTemplates
      });

      const webhookData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: signupEmail,
        mobile: formData.phone,
        company: formData.company,
        plan: selectedPlanDetails.planName,
        source: "Brandify App Signup",
        timestamp: new Date().toISOString()
      };

      fetch("https://cloud.activepieces.com/api/v1/webhooks/HfoxJpGT4nQbK0lWGRcI0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookData),
      }).catch(err => console.error("Webhook trigger failed", err));

      // Hard reload pushes them into the authenticated app state perfectly
      window.location.href = "/marketplace";
      
    } catch (error) {
      console.error("Failed to setup account", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleContactUs = () => {
    window.location.href = "mailto:support@brandify.zone?subject=Upgrade%20to%20Premium%20Plan";
  };

  return (
    <div className="min-h-screen bg-muted/20 py-16 px-4 flex flex-col items-center">
      <div className="text-center max-w-3xl mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Choose your Brandify plan</h1>
        <p className="text-lg text-muted-foreground">Select the plan that best fits your business needs. You can start with our 14-day free trial right now.</p>
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Yearly <Badge variant="secondary" className="ml-1 bg-green-500/10 text-green-700 hover:bg-green-500/20">2 Months Free</Badge>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 max-w-7xl w-full">
        {/* FREE TRIAL */}
        <Card className="flex flex-col relative border-border">
          <CardHeader>
            <CardTitle className="text-xl">Free Trial</CardTitle>
            <CardDescription>Test the waters</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-bold">
              BD 0<span className="ml-1 text-xl font-medium text-muted-foreground">/ 14 days</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 20 total credits</li>
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 1 free marketplace template</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSelectPlan("Free Trial", "20", "1")}>Start Free Trial</Button>
          </CardFooter>
        </Card>

        {/* BRONZE */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Bronze</CardTitle>
            <CardDescription>For startups</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-bold">
              BD {isYearly ? "50" : "5"}<span className="ml-1 text-xl font-medium text-muted-foreground">/ {isYearly ? "yr" : "mo"}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 60 Credits</li>
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> Up to 5 templates</li>
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 1 free marketplace template</li>
            </ul>
          </CardContent>
          <CardFooter><Button variant="outline" className="w-full" onClick={handleContactUs}>Contact Us</Button></CardFooter>
        </Card>

        {/* SILVER */}
        <Card className="flex flex-col border-primary shadow-md relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">Most Popular</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Silver</CardTitle>
            <CardDescription>For growing businesses</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-bold">
              BD {isYearly ? "100" : "10"}<span className="ml-1 text-xl font-medium text-muted-foreground">/ {isYearly ? "yr" : "mo"}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 150 Credits</li>
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> Up to 10 templates</li>
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 2 free marketplace templates</li>
            </ul>
          </CardContent>
          <CardFooter><Button className="w-full" onClick={handleContactUs}>Contact Us</Button></CardFooter>
        </Card>

        {/* GOLD */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">Gold <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /></CardTitle>
            <CardDescription>For power users</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-bold">
              BD {isYearly ? "200" : "20"}<span className="ml-1 text-xl font-medium text-muted-foreground">/ {isYearly ? "yr" : "mo"}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 360 Credits</li>
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> Up to 20 templates</li>
              <li className="flex gap-3"><Check className="h-4 w-4 text-primary shrink-0" /> 3 free marketplace templates</li>
            </ul>
          </CardContent>
          <CardFooter><Button variant="outline" className="w-full" onClick={handleContactUs}>Contact Us</Button></CardFooter>
        </Card>
      </div>

      {/* FINALIZATION MODAL */}
      <Dialog open={showFormModal} onOpenChange={(open) => !loading && setShowFormModal(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Almost there!</DialogTitle>
            <DialogDescription>Let's finalize your account details to set up your {selectedPlanDetails?.planName} workspace.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFinalizeAccount} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input type="tel" required placeholder="+973 XXXX XXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Complete Setup"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelectPlan;
