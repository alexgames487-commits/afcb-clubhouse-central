import { createFileRoute } from "@tanstack/react-router";
import { ValueChart } from "@/components/afcb/value-chart";
import { TrendingUp, TrendingDown, Coins, ArrowLeftRight } from "lucide-react";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel, StatCard, Trend } from "@/components/afcb/ui";
import { PlayersTable, TransfersTable } from "@/components/afcb/tables";
import { demoPlayers, coins } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/mercado")({ head: () => seo("AFCB Market", "Mercado de jogadores, valorização e transferências em AFCB Coins."), component: Page });

function Page() {
  const byChange = [...demoPlayers].sort((a, b) => b.change - a.change);
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="AFCB Market" title="Mercado de jogadores" description="Moeda oficial: AFCB Coins (AC). Valores, valorização e movimentações do mercado." demo />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Volume negociado" value={coins(537000)} icon={Coins} tone="gold" hint="Exemplo" />
        <StatCard label="Transferências" value={4} icon={ArrowLeftRight} hint="Exemplo" />
        <StatCard label="Maior alta" value={`+${byChange[0]?.change.toFixed(1) ?? "0"}%`} icon={TrendingUp} tone="success" hint={byChange[0]?.name ?? "—"} />
        <StatCard label="Maior queda" value={`${byChange.at(-1)?.change.toFixed(1) ?? "0"}%`} icon={TrendingDown} hint={byChange.at(-1)?.name ?? "—"} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Histórico de preços — índice do mercado" className="lg:col-span-2"><ValueChart /></Panel>
        <Panel title="Ranking de valorização">
          <ul className="divide-y divide-border">{byChange.slice(0, 6).map((p) => <li key={p.id} className="flex items-center justify-between py-2 text-sm"><span>{p.name}</span><span className="flex items-center gap-3"><span className="text-gold">{coins(p.value)}</span><Trend value={p.change} /></span></li>)}</ul>
        </Panel>
      </div>
      <Panel title="Jogadores disponíveis" className="mt-6"><PlayersTable /></Panel>
      <Panel title="Movimentações e histórico de negociações" className="mt-6"><TransfersTable /></Panel>
    </Container></PublicLayout>
  );
}
