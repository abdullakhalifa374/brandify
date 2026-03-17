import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react"; // <-- Added for the error icon

const Signup = () => {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // <-- Added error state
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null); // Clear old errors when trying again

    try {
      // 1. Create the user in Firebase
      await signup(form.email, form.password);
      
      // 2. Send the data to your Activepieces Webhook
      const webhookData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.phone,
        company: form.company,
        source: "Brandify App Signup",
        timestamp: new Date().toISOString()
      };

      await fetch("https://cloud.activepieces.com/api/v1/webhooks/HfoxJpGT4nQbK0lWGRcI0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      });

      // 3. Redirect to the App Dashboard
      navigate("/app");
      
    } catch (error: any) {
      console.error("Signup failed:", error);
      // NEW: Catch the error and display it on the screen!
      setErrorMessage(error.message || "An unknown error occurred while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Start your free trial</CardTitle>
          <CardDescription>14 days free • 25 credits • No credit card required</CardDescription>
        </CardHeader>
        <CardContent>

          {/* NEW: Error Display Box */}
          {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start gap-3 text-sm">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required value={form.firstName} onChange={e => update("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required value={form.lastName} onChange={e => update("lastName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" required value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+973 XXXX XXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" required value={form.company} onChange={e => update("company", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={form.password} onChange={e => update("password", e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
