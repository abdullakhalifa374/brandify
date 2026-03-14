import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockMarketplaceForms, mockMarketplaceImages, getUniqueValues } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import TemplateCard from "@/components/TemplateCard";
import FilterBar from "@/components/FilterBar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FORMS_BASE = "https://forms.brandify.zone";

const Marketplace = () => {
  const { user, client } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const categories = getUniqueValues(mockMarketplaceForms, "category");
  const types = getUniqueValues(mockMarketplaceForms, "type");

  const filtered = mockMarketplaceForms.filter(f => {
    if (category !== "all" && f.category !== category) return false;
    if (type !== "all" && f.type !== type) return false;
    return true;
  });

  const selected = mockMarketplaceForms.find(f => f.templateId === selectedTemplate);
  const selectedImages = mockMarketplaceImages.filter(i => i.templateId === selectedTemplate);

  const handlePurchase = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (selected && client) {
      const url = `${FORMS_BASE}/services/?mobile=${client.mobile}&service=template&template=${selected.templateId}&price=${selected.price}&email=${client.email}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground mt-1">Browse and purchase premium templates</p>
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
            key={f.templateId}
            preview={f.preview}
            title={f.template}
            category={f.category}
            type={f.type}
            price={f.price}
            ctaLabel="View Details"
            onCtaClick={() => { setSelectedTemplate(f.templateId); setImageIndex(0); }}
          />
        ))}
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selected && (
            <div className="grid md:grid-cols-2">
              {/* Image carousel */}
              <div className="relative bg-muted aspect-square md:aspect-auto">
                <img
                  src={selectedImages[imageIndex]?.image || selected.preview}
                  alt={selected.template}
                  className="h-full w-full object-cover"
                />
                {selectedImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex(i => (i - 1 + selectedImages.length) % selectedImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1.5 hover:bg-card"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setImageIndex(i => (i + 1) % selectedImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-1.5 hover:bg-card"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {selectedImages.map((_, i) => (
                        <div key={i} className={`h-1.5 w-1.5 rounded-full ${i === imageIndex ? "bg-primary" : "bg-card/60"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-foreground">{selected.template}</h2>
                <div className="flex gap-1.5">
                  <Badge variant="secondary">{selected.category}</Badge>
                  <Badge variant="outline">{selected.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                <p className="text-2xl font-bold text-foreground">{selected.price} BD</p>
                <Button className="w-full" onClick={handlePurchase}>
                  {user ? "Purchase" : "Login to Purchase"}
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
