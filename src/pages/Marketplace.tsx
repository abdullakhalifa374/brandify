import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMarketplaceData } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
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
  const [type, setType] = useState("all"); // NEW: Type state
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

        const parsedImages = imageRows.slice(1).map((row: any[]) => ({
          template_id: row[1] || "",
          color: row[2] || "Default",
          url: row[3] || ""
        }));

        const formattedData: MarketplaceTemplate[] = libraryRows.slice(1).map((row: any[]) => {
          const tId = row[1] || "";
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
    setActiveImageIndex(0); 
  };

const { user, client } = useAuth(); // Make sure 'client' is destructured here!
  const [isClaiming, setIsClaiming] = useState(false);

  // Check if they have free claims available
  const hasFreeClaims = client ? parseInt(client.freeTemplates.toString()) > parseInt(client.templatesUsed.toString()) : false;

  const handlePurchase = async (template: MarketplaceTemplate) => {
    if (!user || !client) {
      navigate("/login");
      return;
    }

    if (hasFreeClaims) {
      // Execute the Claim logic
      setIsClaiming(true);
      try {
        const { claimFreeTemplate } = await import("@/lib/googleSheets");
        await claimFreeTemplate(client.mobile, template.template_id);
        alert("Template Claimed Successfully! It has been added to your Account.");
        window.location.href = "/app/templates"; // Redirect them to see their new template
      } catch (error) {
        console.error("Failed to claim:", error);
        alert("Something went wrong while claiming. Please try again.");
      } finally {
        setIsClaiming(false);
      }
    } else {
      // Execute standard Purchase logic
      const price = template.price;
      const tId = template.template_id;
      const email = encodeURIComponent(user.email || "");
      const purchaseUrl = `${FORMS_SERVICES_BASE}?mobile=${client.mobile}&service=template&template=${tId}&price=${price}&email=${email}`;
      window.open(purchaseUrl, "_blank");
    }
  };
  
  // NEW: Dynamic extractors for both Category and Type
  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));
  const types = Array.from(new Set(templates.map(t => t.type).filter(Boolean)));

  // NEW: Filtering checks both category and type
  const filteredTemplates = templates.filter(f => {
    if (category !== "all" && f.category !== category) return false;
    if (type !== "all" && f.type !== type) return false;
    return true;
  });

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
            types={types}
            selectedCategory={category}
            selectedType={type}
            onCategoryChange={setCategory}
            onTypeChange={setType}
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

      {/* CONTENT GRID (Tabs Removed) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border mt-0">
          <p className="text-muted-foreground">No templates found for these filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-0">
          {filteredTemplates.map(f => (
            <TemplateCard
              key={f.template_id || Math.random().toString()}
              preview={f.mainPreview}
              title={f.title}
              category={f.category}
              type={f.type} // Passes the type so the badge shows
              price={f.price}
              ctaLabel="View Details"
              onCtaClick={() => handleViewDetails(f)}
            />
          ))}
        </div>
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
                      
                      {/* FIX: Only show the label if a color exists AND it is NOT "Default" */}
                      {img.color && img.color.toLowerCase() !== 'default' && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center">
                          {img.color}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

<div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">{selectedTemplate.price} BD</p>
                </div>
                <Button size="lg" onClick={() => handlePurchase(selectedTemplate)} disabled={isClaiming}>
                  {isClaiming ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Claiming...</>
                  ) : hasFreeClaims ? (
                    <>Claim for Free ({(parseInt(client.freeTemplates.toString()) - parseInt(client.templatesUsed.toString()))} left)</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5 mr-2" /> {user ? "Purchase Now" : "Login to Purchase"}</>
                  )}
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
