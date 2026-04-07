import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateCardProps {
  preview: string;
  title: string;
  category: string;
  type?: string; 
  size?: string; 
  credit?: number;
  price?: number;
  usage?: number;
  ctaLabel: string;
  onCtaClick: () => void;
}

const TemplateCard = ({ preview, title, category, type, size, credit, price, usage, ctaLabel, onCtaClick }: TemplateCardProps) => {
  return (
    <Card className="group overflow-hidden border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      
      {/* DESIGN UPDATE: 5px padding with card background (white), inner background #F7F8FC */}
      <div className="aspect-square w-full bg-card p-[5px] overflow-hidden">
        <div className="h-full w-full bg-[#F7F8FC] flex items-center justify-center overflow-hidden rounded-sm">
          <img
            src={preview}
            alt={title}
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{title}</h3>
        
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* TAG ORDER UPDATE: 1. Personal/Business, 2. Category, 3. File Type (Size) */}
          {type && <Badge variant="outline" className="text-xs font-medium">{type}</Badge>}
          <Badge variant="secondary" className="text-xs font-medium">{category}</Badge>
          {size && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent text-xs font-medium">{size}</Badge>}
        </div>

        <div className="flex items-center justify-between">
          {credit !== undefined && (
            <span className="text-xs text-muted-foreground">{credit} credit{credit !== 1 ? "s" : ""}</span>
          )}
          {price !== undefined && (
            <span className="text-sm font-semibold text-foreground">{price} BD</span>
          )}
          {usage !== undefined && (
            <span className="text-xs text-muted-foreground">{usage} uses</span>
          )}
        </div>

        {/* BUTTON DESIGN UPDATE: Custom Colors */}
        <Button 
          onClick={onCtaClick} 
          className="w-full bg-[#F0EFFC] text-[#3933EB] border border-[#C5C5F9] hover:bg-[#E2E0F9] transition-colors" 
          size="sm"
        >
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
