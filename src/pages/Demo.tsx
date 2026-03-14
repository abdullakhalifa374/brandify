import { useState, useEffect } from "react";
import { mockDemoForms, getUniqueValues } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const FORMS_BASE = "https://forms.brandify.zone";

const Demo = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerEmail, setBannerEmail] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    } else {
      const cookie = document.cookie.split("; ").find(c => c.startsWith("brandify_email="));
      if (cookie) {
        setEmail(cookie.split("=")[1]);
      } else {
        setShowBanner(true);
      }
    }
  }, [user]);

  const handleSaveEmail = () => {
    if (bannerEmail) {
      document.cookie = `brandify_email=${bannerEmail};max-age=${60 * 60 * 24 * 30};path=/`;
      setEmail(bannerEmail);
    }
    setShowBanner(false);
  };

  const categories = getUniqueValues(mockDemoForms, "category");
  const types = getUniqueValues(mockDemoForms, "type");

  const filtered = mockDemoForms.filter(f => {
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
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground flex-shrink-0">Enter your email to save progress (optional):</p>
          <Input
            type="email"
            placeholder="you@email.com"
            value={bannerEmail}
            onChange={e => setBannerEmail(e.target.value)}
            className="max-w-xs"
          />
          <Button size="sm" onClick={handleSaveEmail}>Save</Button>
          <button onClick={() => setShowBanner(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demo Templates</h1>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(f => (
          <TemplateCard
            key={f.frontly_id}
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
    </div>
  );
};

export default Demo;
