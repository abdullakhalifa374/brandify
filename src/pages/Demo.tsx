import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDemoTemplates } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle

const FORMS_BASE = "https://forms.brandify.zone";

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
  
  const [templates, setTemplates] = useState<DemoTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: State to hold and display the exact error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        setErrorMessage(null); // Reset error before fetching
        
        const rows = await getDemoTemplates();
        
        if (!rows || rows.length === 0) {
           setErrorMessage("Connection successful, but the Google Sheet returned 0 rows. Check if the sheet is empty or if the tab name is exactly 'Demo Templates'.");
           setIsLoading(false);
           return;
        }

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
      } catch (error: any) {
        console.error("Failed to load demo templates:", error);
        // NEW: Capture the exact error message to show on screen
        setErrorMessage(error.message || "An unknown error occurred while fetching data.");
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
      {/* ... Banner code remains the same ... */}
      
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

      {/* NEW: Error Display Box */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Backend Error:</h3>
            <p className="text-sm mt-1 font-mono">{errorMessage}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : filtered.length === 0 && !errorMessage ? (
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
