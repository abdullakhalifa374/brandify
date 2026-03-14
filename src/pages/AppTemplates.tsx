import { useAuth } from "@/lib/auth-context";
import { mockClientForms, mockFormTemplates } from "@/lib/mock-data";
import TemplateCard from "@/components/TemplateCard";

const FORMS_BASE = "https://forms.brandify.zone";

const AppTemplates = () => {
  const { client } = useAuth();

  // Get user's form IDs
  const userFormIds = mockClientForms
    .filter(cf => cf.mobile === client?.mobile)
    .map(cf => cf.id);

  // Match with form templates
  const userTemplates = mockFormTemplates.filter(ft => userFormIds.includes(ft.id));

  const handleUseTemplate = (formUrl: string) => {
    const url = `${FORMS_BASE}/${formUrl}/?mb=${client?.mobile}&gd=${client?.googleDrive}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Templates</h1>
        <p className="text-muted-foreground mt-1">Your available marketing templates</p>
      </div>

      {userTemplates.length === 0 ? (
        <p className="text-muted-foreground">No templates assigned yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userTemplates.map(t => (
            <TemplateCard
              key={t.id}
              preview={t.preview}
              title={t.template}
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
