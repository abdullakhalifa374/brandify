import { useAuth } from "@/lib/auth-context";
import TemplateCard from "@/components/TemplateCard";

const FORMS_BASE = "https://forms.brandify.zone";

const AppTemplates = () => {
  // We pull BOTH the client profile and their specific templates from context
  const { client, templates } = useAuth();

  const handleUseTemplate = (formUrl: string) => {
    let finalUrl = formUrl;
    
    // Clean up the URL just like we did in the Demo
    if (!finalUrl.startsWith('http')) {
      const cleanFormUrl = formUrl.replace(/^\/+/, ''); 
      finalUrl = `${FORMS_BASE}/${cleanFormUrl}`;
    }
    
    // Attach the secure URL parameters
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}mb=${client?.mobile || ''}&gd=${client?.googleDrive || ''}`;
    
    window.open(finalUrl, "_blank");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Templates</h1>
        <p className="text-muted-foreground mt-1">Your available marketing templates</p>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No templates assigned yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map(t => (
            <TemplateCard
              key={t.id || Math.random().toString()}
              preview={t.preview}
              title={t.title}
              category={t.category}
              type={t.type}
              credit={t.credit}
              ctaLabel="Use Template"
              onCtaClick={() => handleUseTemplate(t.formUrl)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppTemplates;
