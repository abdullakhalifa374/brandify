import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateCardProps {
  preview: string;
  title: string;
  category: string;
  type?: string; 
  size?: string; // NEW: Added size property
  credit?: number;
  price?: number;
  usage?: number;
  ctaLabel: string;
  onCtaClick: () => void;
}

const TemplateCard = ({ preview, title, category, type, size, credit, price, usage, ctaLabel, onCtaClick }: TemplateCardProps) => {
  return (
    <Card className="group overflow-hidden border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* DESIGN UPDATE: aspect-square, padding 20px, #F7F8FC background */}
      <div className="aspect-square w-full bg-[#F7F8FC] p-[20px] overflow-hidden flex items-center justify-center">
        <img
          src={preview}
          alt={title}
          /* DESIGN UPDATE: object-contain makes sure nothing is cropped */
          className="h-full w-full object-contain transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{title}</h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs font-medium">{category}</Badge>
          {type && <Badge variant="outline" className="text-xs font-medium">{type}</Badge>}
          {/* Automatically shows the Size badge if it exists */}
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
        <Button onClick={onCtaClick} className="w-full" size="sm">
          {ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;
