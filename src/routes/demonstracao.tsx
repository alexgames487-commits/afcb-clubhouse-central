import { createFileRoute, Link } from "@tanstack/react-router";
import { PanelShell } from "@/components/afcb/panel-shell";
import { PanelContent } from "@/components/afcb/panel-content";
import { Button } from "@/components/ui/button";
import { panelSections } from "@/lib/panel-config";
import { roleLabel, type AppRole } from "@/lib/roles";
import { seo } from "@/lib/seo";

type DemoSearch = { perfil?: AppRole | undefined; section?: string | undefined };
export const Route = createFileRoute("/demonstracao")({
  validateSearch: (search: Record<string, unknown>): DemoSearch => ({
    perfil: search["perfil"] === "superadmin" || search["perfil"] === "club_manager" || search["perfil"] === "player" ? search["perfil"] : undefined,
    section: typeof search["section"] === "string" ? search["section"] : undefined,
  }),
  head: () => seo("Prévia dos painéis", "Painéis demonstrativos da AFCB para administrador, gestor do clube e jogador, sem acesso a dados privados."),
  component: Page,
});

function Page() {
  const { perfil = "superadmin", section = "dashboard" } = Route.useSearch();
  return <PanelShell preview label={roleLabel[perfil]} activeSection={section} items={panelSections[perfil].map((item) => ({ ...item, to: "/demonstracao", section: item.id, perfil }))}>
    <nav aria-label="Perfil de demonstração" className="mb-8 flex flex-wrap gap-2">{(["superadmin", "club_manager", "player"] as const).map((role) => <Button key={role} variant={role === perfil ? "default" : "outline"} asChild><Link to="/demonstracao" search={{ perfil: role, section: "dashboard" }}>{roleLabel[role]}</Link></Button>)}</nav>
    <PanelContent role={perfil} section={section} />
  </PanelShell>;
}