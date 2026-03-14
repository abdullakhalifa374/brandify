import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TemplateCardProps {
  preview: string;
  title: string;
  category: string;
  type: string;
  credit?: number;
  price?: number;
  usage?: number;
  ctaLabel: string;
  onCtaClick: () => void;
}

const TemplateCard = ({ preview, title, category, type, credit, price, usage, ctaLabel, onCtaClick }: TemplateCardProps) => {
  return (
    <Card className="group overflow-hidden border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={preview}
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">{title}</h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs font-medium">{category}</Badge>
          <Badge variant="outline" className="text-xs font-medium">{type}</Badge>
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
