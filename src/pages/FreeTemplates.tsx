import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDemoTemplates } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Save, Edit2, Search, Folder, Maximize, ArrowDownUp } from "lucide-react";

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
  originalIndex: number; 
}

const FreeTemplates = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  
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
          size: row[7] || "", 
          originalIndex: index 
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

  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));
  const sizes = Array.from(new Set(templates.map(t => t.size).filter(Boolean)));

  let processedTemplates = [...templates];

  if (searchQuery) {
    processedTemplates = processedTemplates.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (category !== "all") {
    processedTemplates = processedTemplates.filter(t => t.category === category);
  }
  if (sizeFilter !== "all") {
    processedTemplates = processedTemplates.filter(t => t.size === sizeFilter);
  }
  
  processedTemplates.sort((a, b) => {
    if (sortBy === "a-z") return a.title.localeCompare(b.title);
    if (sortBy === "z-a") return b.title.localeCompare(a.title);
    if (sortBy === "usage-high") return b.usage - a.usage;
    if (sortBy === "oldest") return a.originalIndex - b.originalIndex;
    return b.originalIndex - a.originalIndex; 
  });

  return (
    <div className="container py-8 space-y-8">
      
      {/* DESIGN UPDATE: Centered Header & Centered/Widened Email Collection */}
      <div className="flex flex-col items-center justify-center text-center gap-5 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Free Templates</h1>
          <p className="text-lg text-muted-foreground mt-2">Try our templates completely free</p>
        </div>

        <div className="h-10 flex items-center justify-center w-full"> 
          {email ? (
            <div className="inline-flex items-center gap-2 text-sm bg-primary/10 text-primary px-4 py-2 rounded-md border border-primary/20">
              <span>Saving progress to: <strong>{email}</strong></span>
              {!user && ( 
                <button onClick={() => setEmail("")} className="hover:underline flex items-center gap-1 font-medium ml-3">
                  <Edit2 className="h-3 w-3" /> Change
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full max-w-md">
              <Input
                type="email"
                placeholder="Enter email to save progress"
                value={inputEmail}
                onChange={e => setInputEmail(e.target.value)}
                className="h-10 w-[300px]" /* WIDER INPUT FIELD */
              />
              <Button onClick={handleSaveEmail} className="h-10 px-6">
                <Save className="h-4 w-4 mr-2"/> Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* FILTERS DESIGN: No background, Search left, Filters right */}
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          
          {/* Search (Left) */}
          <div className="relative w-full md:max-w-sm shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A6]" />
            <Input 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full rounded-full bg-[#F1F2FA] border border-[#D8DEEF] text-[#000000] focus-visible:ring-1 focus-visible:ring-[#C5C5F9]"
            />
          </div>

          {/* Dropdown Filters (Right) */}
          <div className="flex flex-row items-center gap-3 overflow-x-auto w-full md:w-auto scrollbar-hide pb-2 md:pb-0">
            {/* Category Filter */}
            <div className="relative shrink-0">
              <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A6]" />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 pl-9 pr-8 rounded-full border border-[#D8DEEF] bg-[#F1F2FA] text-[#000000] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5C5F9] appearance-none outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A94A6]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {/* Size Filter */}
            <div className="relative shrink-0">
              <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A6]" />
              <select 
                value={sizeFilter} 
                onChange={(e) => setSizeFilter(e.target.value)}
                className="h-10 pl-9 pr-8 rounded-full border border-[#D8DEEF] bg-[#F1F2FA] text-[#000000] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5C5F9] appearance-none outline-none cursor-pointer"
              >
                <option value="all">All Sizes</option>
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A94A6]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="relative shrink-0">
              <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A6]" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 pl-9 pr-8 rounded-full border border-[#D8DEEF] bg-[#F1F2FA] text-[#000000] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5C5F9] appearance-none outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Alphabetical (A-Z)</option>
                <option value="z-a">Alphabetical (Z-A)</option>
                <option value="usage-high">Most Popular</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A94A6]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

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
      ) : processedTemplates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg">
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
