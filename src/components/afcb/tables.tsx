import { Crest, Trend, DemoBadge, StatCard } from "./ui";
import { UserRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { demoStandings, demoPlayers, demoTransfers, clubById, playerById, coins, type DemoPlayer } from "@/lib/demo-data";

export function StandingsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2 pr-2">#</th><th>Clube</th><th className="text-center">P</th><th className="text-center">J</th><th className="text-center">V</th><th className="text-center">E</th><th className="text-center">D</th><th className="text-center">SG</th></tr></thead>
        <tbody>
          {demoStandings.map((r, i) => (
            <tr key={r.club.id} className="border-t border-border">
              <td className="py-2.5 pr-2"><span className={i < 2 ? "font-bold text-primary" : "text-muted-foreground"}>{i + 1}</span></td>
              <td><div className="flex min-w-0 items-center gap-2"><Crest club={r.club} size="sm" /><span className="hidden whitespace-nowrap sm:inline">{r.club.name}</span><span className="sm:hidden">{r.club.short}</span></div></td>
              <td className="text-center font-bold">{r.p}</td><td className="text-center">{r.j}</td><td className="text-center">{r.v}</td><td className="text-center">{r.e}</td><td className="text-center">{r.d}</td><td className="text-center">{r.gp - r.gc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlayersTable({ players = demoPlayers, showValue = true }: { players?: DemoPlayer[]; showValue?: boolean }) {
  return (
    <>
    <div className="divide-y divide-border sm:hidden">{players.map((p) => <article key={p.id} className="py-4"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"><div className="min-w-0"><PlayerDetails player={p} /><p className="mt-1 text-xs text-muted-foreground">{p.position} · {clubById(p.clubId).short}</p></div><span className="rounded border border-primary/30 bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">{p.rating.toFixed(1)}</span></div><div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2"><p className="text-xs text-muted-foreground">{p.goals} gols <span className="mx-1 text-border">/</span> {p.assists} assistências</p>{showValue && <div className="text-right"><p className="text-sm font-semibold text-gold">{coins(p.value)}</p><Trend value={p.change} /></div>}</div></article>)}</div>
    <div className="hidden overflow-x-auto sm:block">
      <table className="data-table w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Jogador</th><th>Pos.</th><th>Clube</th><th className="text-center">Nota</th><th className="text-center">G</th><th className="text-center">A</th>{showValue && <th className="text-right">Valor</th>}</tr></thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-t border-border">
              <td className="py-2.5"><PlayerDetails player={p} /><p className="mt-1 text-xs text-muted-foreground">{p.platformId}</p></td>
              <td><span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">{p.position}</span></td>
              <td><div className="flex items-center gap-2"><Crest club={clubById(p.clubId)} size="sm" /><span className="hidden md:inline">{clubById(p.clubId).name}</span></div></td>
              <td className="text-center font-semibold text-primary">{p.rating.toFixed(1)}</td>
              <td className="text-center">{p.goals}</td><td className="text-center">{p.assists}</td>
              {showValue && <td className="text-right"><p className="font-semibold text-gold">{coins(p.value)}</p><Trend value={p.change} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

function PlayerDetails({ player: p }: { player: DemoPlayer }) {
  return <Dialog><DialogTrigger asChild><Button variant="link" className="h-auto max-w-full justify-start whitespace-normal p-0 text-left text-sm font-medium text-foreground">{p.name}</Button></DialogTrigger><DialogContent className="profile-dialog max-w-2xl"><DialogHeader><DialogTitle className="pr-4 text-3xl">{p.name}</DialogTitle><DialogDescription>{p.platformId} · {p.position} · {clubById(p.clubId).name}</DialogDescription></DialogHeader><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-y border-border py-5"><div className="flex items-center gap-3"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><UserRound /></span><DemoBadge /></div><div className="text-right"><p className="text-xs text-muted-foreground">Valor de mercado</p><p className="font-display text-2xl font-semibold text-gold">{coins(p.value)}</p><Trend value={p.change} /></div></div><div className="grid grid-cols-2 gap-3"><StatCard label="Média de notas" value={p.rating.toFixed(1)} tone="gold" /><StatCard label="Partidas" value={p.matches} /><StatCard label="Gols" value={p.goals} /><StatCard label="Assistências" value={p.assists} /></div><dl className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">{[["Vitórias", p.w], ["Empates", p.d], ["Derrotas", p.l]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-display text-2xl">{value}</dd></div>)}</dl></DialogContent></Dialog>;
}

export function TransfersTable() {
  return (
    <><div className="divide-y divide-border sm:hidden">{demoTransfers.map((t, i) => <article key={i} className="py-4"><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><p className="text-sm font-medium">{playerById(t.player).name}</p><p className="text-sm font-semibold text-gold">{t.amount ? coins(t.amount) : "—"}</p></div><div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Crest club={clubById(t.from)} size="sm" />{clubById(t.from).short}<ArrowRight className="h-3 w-3" /><Crest club={clubById(t.to)} size="sm" />{clubById(t.to).short}<span className="ml-auto">{t.type}</span></div></article>)}</div><div className="hidden overflow-x-auto sm:block">
      <table className="data-table w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Jogador</th><th>De</th><th>Para</th><th>Tipo</th><th className="text-right">Valor</th></tr></thead>
        <tbody>
          {demoTransfers.map((t, i) => (
            <tr key={i} className="border-t border-border">
              <td className="py-2.5 font-medium">{playerById(t.player).name}</td>
              <td><Crest club={clubById(t.from)} size="sm" /></td>
              <td><Crest club={clubById(t.to)} size="sm" /></td>
              <td className="text-muted-foreground">{t.type}</td>
              <td className="text-right font-semibold text-gold">{t.amount ? coins(t.amount) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div></>
  );
}
