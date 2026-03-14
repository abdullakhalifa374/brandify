import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AppAccount = () => {
  const { client } = useAuth();

  if (!client) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Account</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Company</span>
              <p className="font-medium text-foreground">{client.company}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium text-foreground">{client.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Mobile</span>
              <p className="font-medium text-foreground">{client.mobile}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <div className="mt-0.5">
                <Badge variant={client.status === "Active" ? "default" : "destructive"}>
                  {client.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Credits & Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-accent p-4">
              <p className="text-2xl font-bold text-foreground">{client.credit}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-lg bg-accent p-4">
              <p className="text-2xl font-bold text-foreground">{client.used}</p>
              <p className="text-xs text-muted-foreground">Used</p>
            </div>
            <div className="rounded-lg bg-accent p-4">
              <p className="text-2xl font-bold text-primary">{client.remaining}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Plan expires: <span className="font-medium text-foreground">{client.endDate}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppAccount;
