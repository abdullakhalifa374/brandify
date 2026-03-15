import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDemoTemplates } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";

const FORMS_BASE = "https://forms.brandify.zone";

// Define the shape of our template object
interface DemoTemplate {
  frontly_id: string;
  title: string;
  preview: string;
  formUrl: string;
  category: string;
  type: string;
  usage: number;
}

const Demo = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerEmail, setBannerEmail] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  
  // New state for Google Sheets data
  const [templates, setTemplates] = useState<DemoTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle Authentication / Email Cookie
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
    } else {
      const cookie = document.cookie.split("; ").find(c => c.startsWith("brandify_email="));
      if (cookie) {
        setEmail(cookie.split("=")[1]);
      } else {
        setShowBanner(true);
      }
    }
  }, [user]);

  // Fetch Data from Google Sheets
  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        const rows = await getDemoTemplates();
        
        // Remove the first row (headers) and map the rest to objects
        // Google Sheet Columns: frontly_id | Title | preview | Form URL | category | type | Usage
        const formattedData: DemoTemplate[] = rows.slice(1).map((row: any[]) => ({
          frontly_id: row[0] || "",
          title: row[1] || "",
          preview: row[2] || "",
          formUrl: row[3] || "",
          category: row[4] || "",
          type: row[5] || "",
          usage: parseInt(row[6] || "0", 10),
        }));

        setTemplates(formattedData);
      } catch (error) {
        console.error("Failed to load demo templates:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const handleSaveEmail = () => {
    if (bannerEmail) {
      document.cookie = `brandify_email=${bannerEmail};max-age=${60 * 60 * 24 * 30};path=/`;
      setEmail(bannerEmail);
    }
    setShowBanner(false);
  };

  // Dynamically extract unique categories and types from the fetched data
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));
  const types = Array.from(new Set(templates.map(t => t.type).filter(Boolean)));

  const filtered = templates.filter(f => {
    if (category !== "all" && f.category !== category) return false;
    if (type !== "all" && f.type !== type) return false;
    return true;
  });

  const handleTry = (formUrl: string) => {
    const url = email ? `${FORMS_BASE}/${formUrl}/?email=${email}` : `${FORMS_BASE}/${formUrl}/`;
    window.open(url, "_blank");
  };

  return (
    <div className="container py-8 space-y-6">
      {showBanner && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground flex-shrink-0">Enter your email to save progress (optional):</p>
          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <Input
              type="email"
              placeholder="you@email.com"
              value={bannerEmail}
              onChange={e => setBannerEmail(e.target.value)}
            />
            <Button size="sm" onClick={handleSaveEmail}>Save</Button>
          </div>
          <button onClick={() => setShowBanner(false)} className="text-muted-foreground hover:text-foreground hidden sm:block ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Demo Templates</h1>
          <p className="text-muted-foreground mt-1">Try our templates for free</p>
        </div>
        <FilterBar
          categories={categories}
          types={types}
          selectedCategory={category}
          selectedType={type}
          onCategoryChange={setCategory}
          onTypeChange={setType}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No templates found for these filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(f => (
            <TemplateCard
              key={f.frontly_id || Math.random().toString()}
              preview={f.preview}
              title={f.title}
              category={f.category}
              type={f.type}
              usage={f.usage}
              ctaLabel="Try Template"
              onCtaClick={() => handleTry(f.formUrl)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Demo;
