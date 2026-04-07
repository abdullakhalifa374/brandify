import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDemoTemplates } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Save, Edit2, Search } from "lucide-react";

const FORMS_BASE = "https://forms.brandify.zone";

interface FreeTemplate {
  frontly_id: string;
  title: string;
  preview: string;
  formUrl: string;
  category: string;
  type: string;
  usage: number;
  size: string;
  originalIndex: number; // Used for "Newest/Oldest" sorting
}

const FreeTemplates = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  
  // NEW FILTERS
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  const [templates, setTemplates] = useState<FreeTemplate[]>([]);
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

        const formattedData: FreeTemplate[] = rows.slice(1).map((row: any[], index: number) => ({
          frontly_id: row[0] || "",
          title: row[1] || "",
          preview: row[2] || "",
          formUrl: row[3] || "",
          category: row[4] || "",
          type: row[5] || "",
          usage: parseInt(row[6] || "0", 10),
          size: row[7] || "", // Column H
          originalIndex: index // Tracks row number for Newest/Oldest sorting
        }));

        setTemplates(formattedData);
      } catch (error: any) {
        console.error("Failed to load templates:", error);
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

  // EXTRACT DYNAMIC FILTER OPTIONS
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));
  const sizes = Array.from(new Set(templates.map(t => t.size).filter(Boolean)));

  // APPLY FILTERS & SORTING
  let processedTemplates = [...templates];

  // 1. Search
  if (searchQuery) {
    processedTemplates = processedTemplates.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  // 2. Category
  if (category !== "all") {
    processedTemplates = processedTemplates.filter(t => t.category === category);
  }
  // 3. Size
  if (sizeFilter !== "all") {
    processedTemplates = processedTemplates.filter(t => t.size === sizeFilter);
  }
  // 4. Sorting
  processedTemplates.sort((a, b) => {
    if (sortBy === "a-z") return a.title.localeCompare(b.title);
    if (sortBy === "z-a") return b.title.localeCompare(a.title);
    if (sortBy === "usage-high") return b.usage - a.usage;
    if (sortBy === "oldest") return a.originalIndex - b.originalIndex;
    return b.originalIndex - a.originalIndex; // "newest" (default)
  });

  return (
    <div className="container py-8 space-y-8">
      
      {/* HEADER & EMAIL SECTION */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Free Templates</h1>
            <p className="text-muted-foreground mt-1">Try our templates completely free</p>
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
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-card border border-border p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto overflow-x-auto">
            <select 
              value={sizeFilter} 
              onChange={(e) => setSizeFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Sizes</option>
              {sizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">Alphabetical (A-Z)</option>
              <option value="z-a">Alphabetical (Z-A)</option>
              <option value="usage-high">Most Popular</option>
            </select>
          </div>
        </div>
        
        <FilterBar
          categories={categories}
          selectedCategory={category}
          onCategoryChange={setCategory}
        />
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

      {/* CONTENT GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : processedTemplates.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No templates found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {processedTemplates.map(f => (
            <TemplateCard
              key={f.frontly_id || Math.random().toString()}
              preview={f.preview}
              title={f.title}
              category={f.category}
              type={f.type}
              size={f.size}
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

export default FreeTemplates;
