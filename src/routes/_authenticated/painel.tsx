import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PanelShell } from "@/components/afcb/panel-shell";
import { PageHeader, StatCard } from "@/components/afcb/ui";
import { useAuth, roleLabel } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";
import { homeForRoles } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/painel")({ head: () => seo("Meu painel", "Acesse os painéis da AFCB disponíveis para seu perfil."), component: Page });

function Page() {
  const { roles, loading } = useAuth();
  const home = homeForRoles(roles);
  return (
    <PanelShell label="Painel" items={[{ title: "Dashboard", to: "/painel", icon: LayoutDashboard }]}>
      <PageHeader title="Meu painel" description={`Perfil: ${roles.map((r) => roleLabel[r]).join(", ") || (loading ? "carregando…" : "Aguardando atribuição de função")}`} />
      {!loading && home !== "/painel" && <Button asChild><Link to={home}>Abrir meu painel</Link></Button>}
      <div className="mt-8 border-t border-border pt-6"><h2 className="mb-4 text-xl">Painéis de exemplo</h2><div className="flex flex-wrap gap-3">{(["superadmin", "club_manager", "player"] as const).map((perfil) => <Button key={perfil} asChild variant="outline"><Link to="/demonstracao" search={{ perfil }}>{roleLabel[perfil]}</Link></Button>)}</div></div>
    </PanelShell>
  );
}
