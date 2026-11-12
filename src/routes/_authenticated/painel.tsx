import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { PanelShell } from "@/components/afcb/panel-shell";
import { PageHeader, StatCard } from "@/components/afcb/ui";
import { useAuth, roleLabel } from "@/lib/use-auth";
import { demoClubs, demoPlayers, demoCompetitions } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/painel")({ head: () => ({ meta: [{ title: "Meu painel | AFCB" }] }), component: Page });

function Page() {
  const { roles } = useAuth();
  return (
    <PanelShell label="Painel" items={[{ title: "Dashboard", to: "/painel", icon: LayoutDashboard }]}>
      <PageHeader title="Meu painel" description={`Perfil: ${roles.map((r) => roleLabel[r]).join(", ") || "carregando..."}`} demo />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Clubes" value={demoClubs.length} />
        <StatCard label="Jogadores" value={demoPlayers.length} tone="gold" />
        <StatCard label="Competições" value={demoCompetitions.length} tone="success" />
      </div>
    </PanelShell>
  );
}
