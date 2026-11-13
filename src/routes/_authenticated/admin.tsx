import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel, validatePanelSearch } from "@/components/afcb/profile-panel";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/admin")({ validateSearch: validatePanelSearch, head: () => seo("Administração", "Painel do superadministrador AFCB: clubes, jogadores, competições e gestão financeira."), component: Page });
function Page() { const { section } = Route.useSearch(); return <ProfilePanel role="superadmin" section={section} />; }