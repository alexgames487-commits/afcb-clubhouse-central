import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel, validatePanelSearch } from "@/components/afcb/profile-panel";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/clube")({ validateSearch: validatePanelSearch, head: () => seo("Gestão do clube", "Painel do gestor AFCB: elenco, escalação, patrimônio e calendário."), component: Page });
function Page() { const { section } = Route.useSearch(); return <ProfilePanel role="club_manager" section={section} />; }