import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getMarketplaceData } from "@/lib/googleSheets";
import TemplateCard from "@/components/TemplateCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, ShoppingCart, Search, Folder, Maximize } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 

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
  variation: boolean; 
  availableColors: string[]; 
}

const FORMS_SERVICES_BASE = "https://forms.brandify.zone/services/";

const Marketplace = () => {
  const { user, client, templates: ownedClientTemplates } = useAuth(); 
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  
  // NEW FILTERS STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal & Image State
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("Default"); 
  const [activeImageUrl, setActiveImageUrl] = useState<string>(""); 
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

          const isVariation = row[8]?.toLowerCase() === 'yes';
          const colors = ["Default"]; 
          
          if (isVariation) {
            colorHeaders.forEach((colorName, idx) => {
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
    setSelectedColor("Default"); 
    
    const defaultImages = template.gallery.filter(img => img.color.toLowerCase() === "default");
    setActiveImageUrl(defaultImages.length > 0 ? defaultImages[0].url : template.mainPreview);
  };

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    if (selectedTemplate) {
      const colorImages = selectedTemplate.gallery.filter(img => img.color.toLowerCase() === newColor.toLowerCase());
      setActiveImageUrl(colorImages.length > 0 ? colorImages[0].url : selectedTemplate.mainPreview);
    }
  };

  const hasFreeClaims = client ? parseInt(client.freeTemplates.toString()) > parseInt(client.templatesUsed.toString()) : false;

  const handlePurchase = async (template: MarketplaceTemplate) => {
    if (!user || !client) {
      navigate("/login");
      return;
    }

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

  const ownedBaseIds = ownedClientTemplates?.map(t => {
    const parts = t.id.split('-');
    if (parts.length > 1 && ['default','red','blue','green','yellow','orange','pink','purple','black','gray','white'].includes(parts[parts.length-1].toLowerCase())) {
        parts.pop();
    }
    return parts.join('-');
  }) || [];

  const availableTemplates = templates.filter(f => {
    if (ownedBaseIds.includes(f.template_id)) return false; 
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase())) return false; // NEW Search logic
    if (category !== "all" && f.category !== category) return false;
    if (type !== "all" && f.type !== type) return false;
    return true;
  });

  const myOwnedTemplates = templates.filter(f => ownedBaseIds.includes(f.template_id));
  const visibleThumbnails = selectedTemplate?.gallery.filter(img => img.color.toLowerCase() === selectedColor.toLowerCase()) || [];

  return (
    <div className="container py-8 space-y-8">
      
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace</h1>
        <p className="text-muted-foreground">Browse premium templates for your business</p>
      </div>

      {/* NEW FILTERS DESIGN: White background, no border, one line, rounded inputs */}
      <div className="bg-white py-2">
        <div className="flex flex-row items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A6]" />
            <Input 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full rounded-full bg-[#F1F2FA] border border-[#D8DEEF] text-[#000000] focus-visible:ring-1 focus-visible:ring-[#C5C5F9]"
            />
          </div>

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

          {/* Type Filter */}
          <div className="relative shrink-0">
            <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A6]" />
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-full border border-[#D8DEEF] bg-[#F1F2FA] text-[#000000] text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5C5F9] appearance-none outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A94A6]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div><h3 className="font-semibold">Backend Error:</h3><p className="text-sm mt-1 font-mono">{errorMessage}</p></div>
        </div>
      )}

      {/* AVAILABLE TEMPLATES FEED */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        ) : availableTemplates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg mt-0">
            <p className="text-muted-foreground">No available templates found for these filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-0">
            {availableTemplates.map(f => (
              <TemplateCard key={f.template_id || Math.random().toString()} preview={f.mainPreview} title={f.title} category={f.category} type={f.type} price={f.price} ctaLabel="View Details" onCtaClick={() => handleViewDetails(f)} />
            ))}
          </div>
        )}
      </div>

      {/* ALREADY OWNED SECTION */}
      {!isLoading && myOwnedTemplates.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-border">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Templates You Own</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-0 opacity-75">
            {myOwnedTemplates.map(f => (
              <TemplateCard 
                key={`owned-${f.template_id}`} 
                preview={f.mainPreview} 
                title={f.title} 
                category={f.category} 
                type={f.type} 
                price={0} 
                ctaLabel="Already Owned" 
                onCtaClick={() => {
                   alert("You already own a variation of this template! Check the 'My Templates' tab in your dashboard.");
                   navigate("/app/templates");
                }} 
              />
            ))}
          </div>
        </div>
      )}

      {/* PURCHASE MODAL */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedTemplate && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTemplate.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">{selectedTemplate.description || "No description provided."}</DialogDescription>
              </DialogHeader>
              
              <div className="rounded-lg overflow-hidden border border-border bg-[#F7F8FC] aspect-video relative flex items-center justify-center p-[5px]">
                <img 
                  src={activeImageUrl} 
                  alt={selectedTemplate.title}
                  className="w-full h-full object-contain bg-white rounded-sm"
                />
              </div>

              {visibleThumbnails.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {visibleThumbnails.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageUrl(img.url)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all bg-[#F7F8FC] p-1 ${
                        activeImageUrl === img.url ? "border-primary" : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={img.url} alt={`Thumbnail ${idx}`} className="h-full w-full object-contain bg-white" />
                    </button>
                  ))}
                </div>
              )}

              {selectedTemplate.variation && selectedTemplate.availableColors.length > 1 && (
                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-md border border-border">
                  <span className="text-sm font-medium text-foreground">Select Color Variation:</span>
                  <Select value={selectedColor} onValueChange={handleColorChange}>
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
