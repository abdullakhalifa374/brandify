import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMarketplaceData } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // NEW: For colors

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
  variation: boolean; // NEW
  availableColors: string[]; // NEW
}

const FORMS_SERVICES_BASE = "https://forms.brandify.zone/services/";

const Marketplace = () => {
  const { user, client } = useAuth();
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("Default"); // Default selected color
  const [isClaiming, setIsClaiming] = useState(false);

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

        const colorHeaders = ['Red', 'Orange', 'Pink', 'Blue', 'Purple', 'Yellow', 'Green', 'Black', 'Gray', 'White'];

        const formattedData: MarketplaceTemplate[] = libraryRows.slice(1).map((row: any[]) => {
          const tId = row[1] || "";
          const templateImages = parsedImages.filter((img: any) => img.template_id === tId);

          // NEW: Color Extraction Logic from cols 8 to 18
          const isVariation = row[8]?.toLowerCase() === 'yes';
          const colors = ["Default"]; // Always available
          
          if (isVariation) {
            colorHeaders.forEach((colorName, idx) => {
              // Columns 9 through 18 map to the colors
              if (row[9 + idx]?.toLowerCase() === 'yes') {
                colors.push(colorName);
              }
            });
          }

          return {
            frontly_id: row[0] || "",
            template_id: tId,
            title: row[2] || "",
            type: row[3] || "",
            category: row[4] || "",
            description: row[5] || "",
            mainPreview: row[6] || "",
            price: parseFloat(row[7] || "0"),
            gallery: templateImages,
            variation: isVariation,
            availableColors: colors
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
    setSelectedColor("Default"); // Reset to default when opening
  };

  const hasFreeClaims = client ? parseInt(client.freeTemplates.toString()) > parseInt(client.templatesUsed.toString()) : false;

  const handlePurchase = async (template: MarketplaceTemplate) => {
    if (!user || !client) {
      navigate("/login");
      return;
    }

    // Format the ID with the selected color (e.g. travel-1-red or travel-1-default)
    const formattedTemplateId = `${template.template_id}-${selectedColor.toLowerCase()}`;

    if (hasFreeClaims) {
      setIsClaiming(true);
      try {
        const { claimFreeTemplate } = await import("@/lib/googleSheets");
        await claimFreeTemplate(client.mobile, formattedTemplateId);
        alert(`Template Claimed Successfully! It has been added to your Account.`);
        window.location.href = "/app/templates"; 
      } catch (error) {
        console.error("Failed to claim:", error);
        alert("Something went wrong while claiming. Please try again.");
      } finally {
        setIsClaiming(false);
      }
    } else {
      const price = template.price;
      const email = encodeURIComponent(user.email || "");
      const purchaseUrl = `${FORMS_SERVICES_BASE}?mobile=${client.mobile}&service=template&template=${formattedTemplateId}&price=${price}&email=${email}`;
      window.open(purchaseUrl, "_blank");
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category).filter(Boolean)));
  const types = Array.from(new Set(templates.map(t => t.type).filter(Boolean)));

  const filteredTemplates = templates.filter(f => {
    if (category !== "all" && f.category !== category) return false;
    if (type !== "all" && f.type !== type) return false;
    return true;
  });

  // Helper to find the correct image to display in the modal based on color
  const getActiveImage = () => {
    if (!selectedTemplate) return "";
    const colorImage = selectedTemplate.gallery.find(img => img.color.toLowerCase() === selectedColor.toLowerCase());
    return colorImage ? colorImage.url : selectedTemplate.mainPreview;
  };

  return (
    <div className="container py-8 space-y-8">
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

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div><h3 className="font-semibold">Backend Error:</h3><p className="text-sm mt-1 font-mono">{errorMessage}</p></div>
        </div>
      )}

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
              type={f.type} 
              price={f.price}
              ctaLabel="View Details"
              onCtaClick={() => handleViewDetails(f)}
            />
          ))}
        </div>
      )}

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
              
              {/* IMAGE DISPLAY */}
              <div className="rounded-lg overflow-hidden border border-border bg-muted aspect-video relative flex items-center justify-center">
                <img 
                  src={getActiveImage()} 
                  alt={selectedTemplate.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* NEW: COLOR DROPDOWN FILTER */}
              {selectedTemplate.variation && selectedTemplate.availableColors.length > 1 && (
                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-md border border-border">
                  <span className="text-sm font-medium text-foreground">Select Color Variation:</span>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTemplate.availableColors.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <>Claim for Free ({(parseInt((client?.freeTemplates || 0).toString()) - parseInt((client?.templatesUsed || 0).toString()))} left)</>
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
