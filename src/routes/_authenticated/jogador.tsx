import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel, validatePanelSearch } from "@/components/afcb/profile-panel";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/jogador")({ validateSearch: validatePanelSearch, head: () => seo("Meu perfil esportivo", "Painel do jogador AFCB: estatísticas, clube e histórico de valorização."), component: Page });
function Page() { const { section } = Route.useSearch(); return <ProfilePanel role="player" section={section} />; }