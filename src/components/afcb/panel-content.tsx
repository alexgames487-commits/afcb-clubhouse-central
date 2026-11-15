import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Users, Trophy, Coins, ArrowLeftRight, ShoppingCart, UserRound, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, StatCard, Crest, Trend, StatusPill, EmptyState } from "./ui";
import { PlayersTable, TransfersTable, StandingsTable } from "./tables";
import { ValueChart, ClubCoinsChart } from "./value-chart";
import { demoClubs, demoPlayers, demoCompetitions, demoFixtures, demoNews, demoTransfers, coins, clubById, playerById } from "@/lib/demo-data";
import { getPanelSection } from "@/lib/panel-config";
import { roleLabel, type AppRole } from "@/lib/roles";
import type { ReactNode } from "react";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="min-w-0 border-t border-border pt-5"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{children}</section>;
}

function PlayerSearch({ clubOnly = false }: { clubOnly?: boolean }) {
  const [search, setSearch] = useState("");
  const players = demoPlayers.filter((p) => (!clubOnly || p.clubId === "c1") && `${p.name} ${p.platformId} ${p.position}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")));
  return <><div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Buscar jogador" className="pl-9" placeholder="Buscar jogador, ID ou posição" value={search} onChange={(e) => setSearch(e.target.value)} /></div>{players.length ? <PlayersTable players={players} /> : <EmptyState title="Nenhum jogador encontrado" text="Não há exemplos correspondentes à busca." />}</>;
}

function Competitions() {
  return <div className="grid gap-4 md:grid-cols-3">{demoCompetitions.map((c) => <Link key={c.slug} to="/competicoes/$slug" params={{ slug: c.slug }} className="rounded-lg border border-border bg-card p-5 transition hover:border-primary"><StatusPill status={c.status} /><h2 className="mt-4 text-xl font-semibold">{c.name}</h2><p className="mt-2 text-sm text-muted-foreground">{c.format} · {c.season}</p><p className="mt-4 text-sm">{c.clubs} participantes</p></Link>)}</div>;
}

function Fixtures() {
  return <div className="divide-y divide-border">{demoFixtures.filter((f) => f.home === "c1" || f.away === "c1").map((f, i) => <div key={i} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]"><div><p className="mb-2 text-xs text-muted-foreground">{f.date} · {f.comp}</p><div className="flex flex-wrap items-center gap-2 text-sm"><Crest club={clubById(f.home)} size="sm" />{clubById(f.home).name}<span className="text-muted-foreground">×</span><Crest club={clubById(f.away)} size="sm" />{clubById(f.away).name}</div></div><span className="font-display text-xl text-gold">{f.time}</span></div>)}</div>;
}

function Finances({ club = false }: { club?: boolean }) {
  const transfers = demoTransfers.filter((t) => !club || t.from === "c1" || t.to === "c1");
  return <div className="space-y-8"><div className="grid gap-4 sm:grid-cols-2"><StatCard label={club ? "Patrimônio atual" : "Patrimônio dos clubes"} value={coins(club ? (demoClubs[0]?.coins ?? 0) : demoClubs.reduce((v, c) => v + c.coins, 0))} tone="gold" icon={Coins} /><StatCard label="Volume de negociações" value={coins(transfers.reduce((v, t) => v + t.amount, 0))} icon={ArrowLeftRight} /></div><Section title="Movimentações de exemplo"><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="pb-3">Operação</th><th>Jogador</th><th>Tipo</th><th className="text-right">Valor</th></tr></thead><tbody>{transfers.map((t, i) => <tr key={i} className="border-t border-border"><td className="py-4">Exemplo {i + 1}</td><td>{playerById(t.player).name}</td><td>{club ? t.from === "c1" ? "Entrada" : "Saída" : t.type}</td><td className="text-right font-semibold text-gold">{coins(t.amount)}</td></tr>)}</tbody></table></div></Section></div>;
}

function Lineup() {
  const [formation, setFormation] = useState("4-3-3");
  const [selected, setSelected] = useState<Record<number, string>>({});
  const rows = formation === "4-3-3" ? [3, 3, 4, 1] : [2, 4, 4, 1];
  let offset = 0;
  return <div className="space-y-5"><Select value={formation} onValueChange={setFormation}><SelectTrigger className="w-40" aria-label="Formação"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="4-3-3">4-3-3</SelectItem><SelectItem value="4-4-2">4-4-2</SelectItem></SelectContent></Select><div className="pitch mx-auto grid min-h-[440px] max-w-3xl gap-8 rounded-lg border border-success/40 p-2 sm:p-8">{rows.map((count, row) => { const start = offset; offset += count; return <div key={row} className="flex justify-around gap-1 sm:gap-2">{Array.from({ length: count }, (_, i) => { const slot = start + i; return <div key={slot} className="min-w-0 flex-1 max-w-36"><Select value={selected[slot] ?? "empty"} onValueChange={(value) => setSelected((s) => ({ ...s, [slot]: value }))}><SelectTrigger className="h-auto min-h-12 bg-background/90 px-1.5 text-[10px] sm:px-3 sm:text-xs [&>svg]:hidden sm:[&>svg]:block" aria-label={`Jogador da posição ${slot + 1}`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="empty">Posição {slot + 1}</SelectItem>{demoPlayers.filter((p) => p.clubId === "c1" && (!Object.values(selected).includes(p.id) || selected[slot] === p.id)).map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.position}</SelectItem>)}</SelectContent></Select></div>; })}</div>; })}</div><p className="text-sm text-muted-foreground">Escalação de exemplo · alterações não são salvas.</p></div>;
}

function PlayerProfile() {
  const player = demoPlayers[0];
  if (!player) return null;
  return <div className="space-y-8"><div className="flex flex-wrap items-center gap-5"><span className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/10"><UserRound className="h-12 w-12 text-primary" /></span><div><h2 className="text-3xl font-bold">{player.name}</h2><p className="mt-1 text-muted-foreground">{player.platformId} · {player.position}</p><div className="mt-3 flex items-center gap-2"><Crest club={clubById(player.clubId)} size="sm" /><span className="text-sm">{clubById(player.clubId).name}</span></div></div><div className="sm:ml-auto"><p className="text-xs uppercase text-muted-foreground">Valor de mercado</p><p className="mt-1 font-display text-3xl text-gold">{coins(player.value)}</p><Trend value={player.change} /></div></div><PlayerStats /><Section title="Histórico de valorização"><ValueChart /></Section></div>;
}

function PlayerStats() {
  const p = demoPlayers[0];
  if (!p) return null;
  return <><div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><StatCard label="Média de notas" value={p.rating.toFixed(1)} tone="gold" /><StatCard label="Gols" value={p.goals} /><StatCard label="Assistências" value={p.assists} /><StatCard label="Partidas" value={p.matches} /></div><dl className="mt-5 grid grid-cols-3 gap-4 border-y border-border py-5 text-center">{[["Vitórias", p.w], ["Empates", p.d], ["Derrotas", p.l]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-display text-2xl">{value}</dd></div>)}</dl><p className="mt-4 text-sm text-muted-foreground">Estatísticas defensivas: sem registros oficiais.</p></>;
}

function AdminDashboard() {
  return <div className="space-y-8"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Clubes cadastrados" value={demoClubs.length} icon={Shield} /><StatCard label="Jogadores registrados" value={demoPlayers.length} icon={Users} /><StatCard label="Competições ativas" value={demoCompetitions.filter((c) => c.status === "Em andamento").length} icon={Trophy} tone="success" /><StatCard label="Competições encerradas" value={demoCompetitions.filter((c) => c.status === "Encerrada").length} icon={Trophy} tone="gold" /></div><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Janelas BID abertas" value="—" icon={ShoppingCart} hint="Nenhuma janela oficial cadastrada" /><StatCard label="Volume financeiro" value={coins(demoTransfers.reduce((v, t) => v + t.amount, 0))} icon={Coins} tone="gold" /><StatCard label="Solicitações pendentes" value="—" hint="Sem solicitações oficiais" /></div><div className="grid gap-8 xl:grid-cols-[2fr_1fr]"><Section title="Movimentações recentes"><TransfersTable /></Section><Section title="Atividade da federação"><ul className="divide-y divide-border">{demoNews.map((n) => <li key={n.id} className="py-3"><span className="text-xs text-gold">{n.tag} · Exemplo</span><p className="mt-1 text-sm">{n.title}</p></li>)}</ul></Section></div><div className="grid gap-8 xl:grid-cols-2"><Section title="Índice do mercado"><ValueChart /></Section><Section title="Patrimônio × valor do elenco"><ClubCoinsChart /></Section></div></div>;
}

function ClubDashboard() {
  const c = demoClubs[0];
  if (!c) return null;
  const squad = demoPlayers.filter((p) => p.clubId === c.id);
  return <div className="space-y-8"><div className="flex items-center gap-4"><Crest club={c} size="lg" /><div><h2 className="text-3xl font-bold">{c.name}</h2><p className="mt-1 text-muted-foreground">{c.short} · Pro Clubs Old Gen</p></div></div><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Patrimônio" value={coins(c.coins)} tone="gold" icon={Coins} /><StatCard label="Valor do elenco exibido" value={coins(squad.reduce((v, p) => v + p.value, 0))} icon={Users} /><StatCard label="Jogadores no elenco exibido" value={squad.length} icon={Shield} /></div><Section title="Elenco de exemplo"><PlayersTable players={squad} /></Section><Section title="Próximas partidas de exemplo"><Fixtures /></Section></div>;
}

export function PanelContent({ role, section = "dashboard" }: { role: AppRole; section?: string }) {
  const item = getPanelSection(role, section);
  if (!item) return <EmptyState title="Área indisponível" text="Selecione uma área no menu." />;
  let body: ReactNode;
  if (section === "dashboard") body = role === "superadmin" ? <AdminDashboard /> : role === "club_manager" ? <ClubDashboard /> : <PlayerProfile />;
  else if (section === "jogadores" || section === "elenco" || section === "mercado") body = <div className="space-y-8">{section === "mercado" && <Section title="Histórico de preços — AFCB Market"><ValueChart /></Section>}<PlayerSearch clubOnly={section === "elenco"} /></div>;
  else if (section === "clubes") body = <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{demoClubs.map((c) => <article key={c.id} className="rounded-lg border border-border bg-card p-5"><div className="flex items-center gap-3"><Crest club={c} /><h2 className="text-xl">{c.name}</h2></div><p className="mt-4 text-sm text-gold">{coins(c.coins)}</p><p className="mt-1 text-sm text-muted-foreground">{demoPlayers.filter((p) => p.clubId === c.id).length} jogadores exibidos</p></article>)}</div>;
  else if (section === "competicoes") body = <Competitions />;
  else if (section === "transferencias") body = role === "player" ? <EmptyState title="Nenhuma transferência oficial" text="O histórico individual aparecerá após o registro de uma negociação." /> : <TransfersTable />;
  else if (section === "financas") body = <div className="space-y-8"><Finances club={role === "club_manager"} />{role === "superadmin" && <Section title="Comparativo financeiro dos clubes"><ClubCoinsChart /></Section>}</div>;
  else if (section === "escalacao") body = <Lineup />;
  else if (section === "calendario") body = <Fixtures />;
  else if (section === "estatisticas") body = role === "player" ? <PlayerStats /> : <div className="space-y-8"><Section title="Classificação de exemplo"><StandingsTable /></Section><Section title="Estatísticas dos jogadores"><PlayersTable players={role === "club_manager" ? demoPlayers.filter((p) => p.clubId === "c1") : demoPlayers} showValue={false} /></Section></div>;
  else if (section === "valorizacao") body = <Section title="Histórico de preços de exemplo"><ValueChart /></Section>;
  else if (section === "historico") body = <EmptyState title="Nenhum histórico oficial registrado" text="As passagens por clubes serão exibidas após o registro pela federação." />;
  else if (section === "noticias") body = <div className="grid gap-4 md:grid-cols-3">{demoNews.map((n) => <article key={n.id} className="rounded-lg border border-border bg-card p-5"><span className="text-xs text-gold">{n.tag}</span><h2 className="mt-3 text-xl">{n.title}</h2><p className="mt-3 text-sm text-muted-foreground">{n.excerpt}</p></article>)}</div>;
  else if (section === "usuarios") body = <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{Object.entries(roleLabel).map(([r, label]) => <article key={r} className="rounded-lg border border-border bg-card p-5"><h2 className="text-xl">{label}</h2><p className="mt-2 text-sm text-muted-foreground">{r === "superadmin" ? "Administração da federação" : r === "club_manager" ? "Presidência e treinamento do clube" : "Perfil esportivo individual"}</p></article>)}</div><EmptyState title="Nenhum usuário demonstrativo" text="A prévia não exibe dados pessoais nem permite alterar permissões." /></div>;
  else body = <EmptyState title={section === "regulamentos" ? "Nenhum regulamento oficial publicado" : "Configurações oficiais pendentes"} text={section === "regulamentos" ? "Os documentos serão disponibilizados pela administração da AFCB." : "EA SPORTS FC 26 · Pro Clubs · Old Gen · AFCB Coins"} />;
  return <><PageHeader eyebrow={roleLabel[role]} title={item.title} description="Ambiente demonstrativo · sem alteração de registros oficiais." demo />{body}<div className="mt-10 border-t border-border pt-4"><Button asChild variant="ghost" size="sm"><Link to="/">Voltar ao site público</Link></Button></div></>;
}