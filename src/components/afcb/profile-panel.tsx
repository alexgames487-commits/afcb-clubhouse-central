import { PanelShell, RestrictedNotice } from "./panel-shell";
import { PanelContent } from "./panel-content";
import { AdminAccounts, AdminClubs, AdminLiveDashboard, AdminOversight, ManagerClub, PlayerAccount } from "./live-panels";
import { useAuth } from "@/lib/use-auth";
import { canViewPanel, roleLabel, type AppRole } from "@/lib/roles";
import { panelSections } from "@/lib/panel-config";

export type PanelSearch = { section?: string | undefined };
export function validatePanelSearch(search: Record<string, unknown>): PanelSearch {
  return { section: typeof search["section"] === "string" ? search["section"] : undefined };
}

function LiveContent({ role, section }: { role: AppRole; section: string }) {
  if (role === "superadmin") {
    if (section === "clubes") return <AdminClubs />;
    if (section === "usuarios") return <AdminAccounts />;
    if (section === "configuracoes") return <AdminOversight />;
    if (section === "dashboard") return <div className="space-y-8"><AdminLiveDashboard /><PanelContent role={role} section={section} /></div>;
  }
  if (role === "club_manager") {
    if (section === "dashboard") return <ManagerClub />;
    if (section === "elenco") return <ManagerClub roster />;
  }
  if (role === "player" && section === "dashboard") return <div className="space-y-8"><PlayerAccount /><PanelContent role={role} section={section} /></div>;
  return <PanelContent role={role} section={section} />;
}

export function ProfilePanel({ role, section = "dashboard" }: { role: AppRole; section?: string | undefined }) {
  const { roles, loading, error } = useAuth();
  if (loading) return <div role="status" className="p-8 text-muted-foreground">Carregando seu perfil…</div>;
  if (error) return <div role="alert" className="p-8">Não foi possível consultar seu perfil. Atualize a página para tentar novamente.</div>;
  if (!canViewPanel(roles, role)) return <RestrictedNotice role={roleLabel[role]} />;
  const to = role === "superadmin" ? "/admin" : role === "club_manager" ? "/clube" : "/jogador";
  return <PanelShell label={roleLabel[role]} activeSection={section} items={panelSections[role].map((item) => ({ ...item, to, section: item.id }))}><LiveContent role={role} section={section} /></PanelShell>;
}
