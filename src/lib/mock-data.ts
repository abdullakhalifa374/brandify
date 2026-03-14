// Mock data simulating Google Sheets data sources

export interface Client {
  frontly_id: string;
  mobile: string;
  company: string;
  email: string;
  credit: number;
  used: number;
  remaining: number;
  endDate: string;
  status: "Active" | "Expired";
  googleDrive: string;
  firstName: string;
  lastName: string;
}

export interface ClientForm {
  frontly_id: string;
  mobile: string;
  id: string;
}

export interface FormTemplate {
  frontly_id: string;
  template: string;
  id: string;
  category: string;
  type: string;
  credit: number;
  formUrl: string;
  preview: string;
}

export interface DemoForm {
  frontly_id: string;
  title: string;
  preview: string;
  formUrl: string;
  category: string;
  type: string;
  usage: number;
}

export interface MarketplaceForm {
  frontly_id: string;
  templateId: string;
  template: string;
  type: string;
  category: string;
  description: string;
  preview: string;
  price: number;
}

export interface MarketplaceImage {
  frontly_id: string;
  templateId: string;
  color: string;
  image: string;
}

export const mockClient: Client = {
  frontly_id: "1",
  mobile: "97312345678",
  company: "Acme Corp",
  email: "john@acme.com",
  credit: 25,
  used: 8,
  remaining: 17,
  endDate: "2026-03-27",
  status: "Active",
  googleDrive: "1A2B3C4D5E6F",
  firstName: "John",
  lastName: "Doe",
};

export const mockClientForms: ClientForm[] = [
  { frontly_id: "1", mobile: "97312345678", id: "form-001" },
  { frontly_id: "1", mobile: "97312345678", id: "form-002" },
  { frontly_id: "1", mobile: "97312345678", id: "form-003" },
];

export const mockFormTemplates: FormTemplate[] = [
  { frontly_id: "1", template: "Instagram Post — Product Launch", id: "form-001", category: "Social Media", type: "Instagram", credit: 1, formUrl: "ig-product-launch", preview: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop" },
  { frontly_id: "2", template: "Business Card — Modern", id: "form-002", category: "Print", type: "Business Card", credit: 2, formUrl: "business-card-modern", preview: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=300&fit=crop" },
  { frontly_id: "3", template: "Email Banner — Sale", id: "form-003", category: "Email", type: "Banner", credit: 1, formUrl: "email-banner-sale", preview: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&h=300&fit=crop" },
  { frontly_id: "4", template: "LinkedIn Post — Hiring", id: "form-004", category: "Social Media", type: "LinkedIn", credit: 1, formUrl: "linkedin-hiring", preview: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop" },
  { frontly_id: "5", template: "Flyer — Event Promo", id: "form-005", category: "Print", type: "Flyer", credit: 2, formUrl: "flyer-event-promo", preview: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop" },
];

export const mockDemoForms: DemoForm[] = [
  { frontly_id: "1", title: "Instagram Story — Brand Intro", preview: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop", formUrl: "demo-ig-story", category: "Social Media", type: "Instagram", usage: 342 },
  { frontly_id: "2", title: "Facebook Ad — Discount", preview: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=400&h=300&fit=crop", formUrl: "demo-fb-ad", category: "Social Media", type: "Facebook", usage: 198 },
  { frontly_id: "3", title: "Flyer — Restaurant Menu", preview: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop", formUrl: "demo-flyer-menu", category: "Print", type: "Flyer", usage: 156 },
  { frontly_id: "4", title: "Email Header — Newsletter", preview: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop", formUrl: "demo-email-header", category: "Email", type: "Header", usage: 89 },
  { frontly_id: "5", title: "Business Card — Minimal", preview: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop", formUrl: "demo-bcard-minimal", category: "Print", type: "Business Card", usage: 275 },
  { frontly_id: "6", title: "WhatsApp Status — Offer", preview: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", formUrl: "demo-wa-status", category: "Social Media", type: "WhatsApp", usage: 421 },
];

export const mockMarketplaceForms: MarketplaceForm[] = [
  { frontly_id: "1", templateId: "mkt-001", template: "Premium Instagram Bundle", type: "Instagram", category: "Social Media", description: "A collection of 10 Instagram post and story templates designed for product launches, sales announcements, and brand storytelling. Fully customizable with your brand colors and logo.", preview: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop", price: 15 },
  { frontly_id: "2", templateId: "mkt-002", template: "Corporate Stationery Set", type: "Stationery", category: "Print", description: "Complete corporate identity package including business cards, letterheads, envelopes, and presentation folders. Professional and modern design.", preview: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=300&fit=crop", price: 25 },
  { frontly_id: "3", templateId: "mkt-003", template: "Email Marketing Suite", type: "Email", category: "Email", description: "5 responsive email templates for newsletters, promotions, welcome series, and transactional emails. Compatible with all major email platforms.", preview: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop", price: 12 },
  { frontly_id: "4", templateId: "mkt-004", template: "Social Media Mega Pack", type: "Multi-platform", category: "Social Media", description: "20+ templates covering Instagram, Facebook, LinkedIn, and Twitter. Includes posts, stories, covers, and ad formats.", preview: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&h=300&fit=crop", price: 35 },
  { frontly_id: "5", templateId: "mkt-005", template: "Restaurant Branding Kit", type: "Branding", category: "Print", description: "Menu designs, table tent cards, loyalty cards, and social media posts specifically crafted for restaurants and cafes.", preview: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop", price: 20 },
  { frontly_id: "6", templateId: "mkt-006", template: "Real Estate Marketing Pack", type: "Multi-platform", category: "Social Media", description: "Property listing templates, open house flyers, agent branding materials, and social media post templates for real estate professionals.", preview: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop", price: 28 },
];

export const mockMarketplaceImages: MarketplaceImage[] = [
  { frontly_id: "1", templateId: "mkt-001", color: "Blue", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop" },
  { frontly_id: "2", templateId: "mkt-001", color: "Red", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop" },
  { frontly_id: "3", templateId: "mkt-001", color: "Green", image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=600&h=400&fit=crop" },
  { frontly_id: "4", templateId: "mkt-002", color: "White", image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=600&h=400&fit=crop" },
  { frontly_id: "5", templateId: "mkt-002", color: "Dark", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop" },
  { frontly_id: "6", templateId: "mkt-003", color: "Default", image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&h=400&fit=crop" },
  { frontly_id: "7", templateId: "mkt-004", color: "Multi", image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&h=400&fit=crop" },
  { frontly_id: "8", templateId: "mkt-005", color: "Warm", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
  { frontly_id: "9", templateId: "mkt-006", color: "Modern", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop" },
];

// Helper to get unique categories/types
export const getUniqueValues = <T>(items: T[], key: keyof T): string[] => {
  return [...new Set(items.map(item => String(item[key])))];
};
