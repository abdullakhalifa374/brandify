import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMarketplaceData } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MarketplaceImage {
  color: string;
  url: string;
}

interface MarketplaceTemplate {
  frontly_id: string;
  template_id: string;
  title: string;
  type: string;
  category: string;
  description: string;
  price: number;
  mainPreview: string;
  gallery: MarketplaceImage[];
}

const FORMS_SERVICES_BASE = "https://forms.brandify.zone/services/";

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function loadMarketplace() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const result = await getMarketplaceData();
        const libraryRows = result.library || [];
        const imageRows = result.images || [];

        if (libraryRows.length <= 1) {
           setErrorMessage("The Library sheet seems to be empty.");
           return;
        }

        // Parse images sheet (Skip header row 0)
        // Columns: frontly_id | template id | color | image
        const parsedImages = imageRows.slice(1).map((row: any[]) => ({
          template_id: row[1] || "",
          color: row[2] || "Default",
          url: row[3] || ""
        }));

        // Parse library sheet (Skip header row 0)
        // Columns: frontly_id | template id | Template | Type | Category | Description | Preview | Price
        const formattedData: MarketplaceTemplate[] = libraryRows.slice(1).map((row: any[]) => {
          const tId = row[1] || "";
          // Find all extra images that belong to this template ID
          const templateImages = parsedImages.filter((img: any) => img.template_id === tId);

          return {
            frontly_id: row[0] || "",
            template_id: tId,
            title: row[2] || "",
            type: row[3] || "",
            category: row[4] || "",
            description: row[5] || "",
            mainPreview: row[6] || "",
            price: parseFloat(row[7] || "0"),
            gallery: templateImages
          };
        });

        setTemplates(formattedData);
      } catch (error: any) {
        console.error("Failed to load marketplace templates:", error);
        setErrorMessage(error.message || "An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMarketplace();
  }, []);

  const handleViewDetails = (template: MarketplaceTemplate) => {
    setSelectedTemplate(template);
    setActiveImageIndex(0); // Reset to first image when opening
  };

  const handlePurchase = (template: MarketplaceTemplate) => {
    if (!user) {
      // If not logged in, send them to login
      navigate("/login");
      return;
    }
    
    // Construct purchase URL
    // Note: 'mobile' will be added in Phase 3 when we load user profiles. For now we use Firebase email.
    const price = template.price;
    const tId = template.template_id;
    const email = encodeURIComponent(user.email || "");
    const purchaseUrl = `${FORMS_SERVICES_BASE}?mobile=&service=template&template=${tId}&price=${price}&email=${email}`;
    
    window.open(purchaseUrl, "_blank");
  };

  // Filtering Logic
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));
  const filteredByCategory = templates.filter(f => category === "all" || f.category === category);
  
  const businessTemplates = filteredByCategory.filter(t => t.type?.toLowerCase() !== 'personal');
  const personalTemplates = filteredByCategory.filter(t => t.type?.toLowerCase() === 'personal');

  // The grid render function to keep things clean
  const renderGrid = (items: MarketplaceTemplate[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No templates found for this category.</p>
        </div>
      );
    }
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(f => (
          <TemplateCard
            key={f.template_id || Math.random().toString()}
            preview={f.mainPreview}
            title={f.title}
            category={f.category}
            price={f.price}
            ctaLabel="View Details"
            onCtaClick={() => handleViewDetails(f)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Browse premium templates for your business</p>
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

      {/* TABS & CONTENT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      ) : (
        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>
          <TabsContent value="business" className="mt-0">{renderGrid(businessTemplates)}</TabsContent>
          <TabsContent value="personal" className="mt-0">{renderGrid(personalTemplates)}</TabsContent>
        </Tabs>
      )}

      {/* TEMPLATE DETAILS MODAL */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTemplate.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {selectedTemplate.description || "No description provided."}
                </DialogDescription>
              </DialogHeader>
              
              {/* Main Image View */}
              <div className="rounded-lg overflow-hidden border border-border bg-muted aspect-video relative">
                <img 
                  src={
                    selectedTemplate.gallery.length > 0 
                      ? selectedTemplate.gallery[activeImageIndex].url 
                      : selectedTemplate.mainPreview
                  } 
                  alt={selectedTemplate.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnail Gallery (Only show if there are extra images) */}
              {selectedTemplate.gallery.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedTemplate.gallery.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                        activeImageIndex === idx ? "border-primary" : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={img.url} alt={`${img.color} variant`} className="h-full w-full object-cover" />
                      {/* Optional: Show color name label on hover or bottom */}
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center">
                        {img.color}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Footer / Purchase Action */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">{selectedTemplate.price} BD</p>
                </div>
                <Button size="lg" onClick={() => handlePurchase(selectedTemplate)}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {user ? "Purchase Now" : "Login to Purchase"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
