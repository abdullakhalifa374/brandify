import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDemoTemplates } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, Save, Edit2 } from "lucide-react";

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
  const [inputEmail, setInputEmail] = useState("");
  const [category, setCategory] = useState("all");
  
  const [templates, setTemplates] = useState<DemoTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
    } else {
      const cookie = document.cookie.split("; ").find(c => c.startsWith("brandify_email="));
      if (cookie) {
        setEmail(cookie.split("=")[1]);
      }
    }
  }, [user]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const rows = await getDemoTemplates();
        
        if (!rows || rows.length === 0) {
           setErrorMessage("Connection successful, but the Google Sheet returned 0 rows.");
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
        setErrorMessage(error.message || "An unknown error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const handleSaveEmail = () => {
    if (inputEmail) {
      document.cookie = `brandify_email=${inputEmail};max-age=${60 * 60 * 24 * 30};path=/`;
      setEmail(inputEmail);
      setInputEmail(""); 
    }
  };

  const handleTry = (formUrl: string) => {
    let finalUrl = formUrl;
    
    if (!finalUrl.startsWith('http')) {
      const cleanFormUrl = formUrl.replace(/^\/+/, ''); 
      finalUrl = `${FORMS_BASE}/${cleanFormUrl}`;
    }
    
    if (email) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}email=${encodeURIComponent(email)}`;
    }
    
    window.open(finalUrl, "_blank");
  };

  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));

  const filteredByCategory = templates.filter(f => {
    if (category !== "all" && f.category !== category) return false;
    return true;
  });

  const businessTemplates = filteredByCategory.filter(t => t.type?.toLowerCase() !== 'personal');
  const personalTemplates = filteredByCategory.filter(t => t.type?.toLowerCase() === 'personal');

  return (
    <div className="container py-8 space-y-8">
      
      {/* HEADER & EMAIL SECTION */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Demo Templates</h1>
            <p className="text-muted-foreground mt-1">Try our templates for free</p>
          </div>

          <div className="h-10"> 
            {email ? (
              <div className="inline-flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-md border border-primary/20">
                <span>Saving progress to: <strong>{email}</strong></span>
                {!user && ( 
                  <button onClick={() => setEmail("")} className="hover:underline flex items-center gap-1 font-medium ml-2">
                    <Edit2 className="h-3 w-3" /> Change
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 max-w-sm">
                <Input
                  type="email"
                  placeholder="Enter email to save progress"
                  value={inputEmail}
                  onChange={e => setInputEmail(e.target.value)}
                  className="h-9"
                />
                <Button size="sm" onClick={handleSaveEmail} className="h-9">
                  <Save className="h-4 w-4 mr-2"/> Save
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <FilterBar
            categories={categories}
            selectedCategory={category}
            onCategoryChange={setCategory}
          />
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Backend Error:</h3>
            <p className="text-sm mt-1 font-mono">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* CONTENT & TABS */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : (
        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="mt-0">
             {businessTemplates.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-lg border border-border">
                  <p className="text-muted-foreground">No business templates found for this category.</p>
                </div>
             ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {businessTemplates.map(f => (
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
          </TabsContent>

          <TabsContent value="personal" className="mt-0">
             {personalTemplates.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-lg border border-border">
                  <p className="text-muted-foreground">No personal templates found for this category.</p>
                </div>
             ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {personalTemplates.map(f => (
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Demo;
