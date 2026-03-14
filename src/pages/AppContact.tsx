import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail } from "lucide-react";

const AppContact = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our support team is here to help you with any questions about your templates, account, or billing.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" asChild>
              <a href="https://wa.me/97312345678" target="_blank" rel="noopener noreferrer">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@brandify.zone">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppContact;
