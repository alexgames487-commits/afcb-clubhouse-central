import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Coins, ArrowLeftRight } from "lucide-react";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel, StatCard, Trend } from "@/components/afcb/ui";
import { PlayersTable, TransfersTable } from "@/components/afcb/tables";
import { demoPlayers, valueHistory, coins } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/mercado")({ head: () => seo("AFCB Market", "Mercado de jogadores, valorização e transferências em AFCB Coins."), component: Page });

export function ValueChart() {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={valueHistory}>
          <defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="w" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
          <Area type="monotone" dataKey="v" stroke="var(--primary)" fill="url(#vg)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Page() {
  const byChange = [...demoPlayers].sort((a, b) => b.change - a.change);
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="AFCB Market" title="Mercado de jogadores" description="Moeda oficial: AFCB Coins (AC). Valores, valorização e movimentações do mercado." demo />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Volume negociado" value={coins(537000)} icon={Coins} tone="gold" hint="Exemplo" />
        <StatCard label="Transferências" value={4} icon={ArrowLeftRight} hint="Exemplo" />
        <StatCard label="Maior alta" value={`+${byChange[0]!.change.toFixed(1)}%`} icon={TrendingUp} tone="success" hint={byChange[0]!.name} />
        <StatCard label="Maior queda" value={`${byChange.at(-1)!.change.toFixed(1)}%`} icon={TrendingDown} hint={byChange.at(-1)!.name} />
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
