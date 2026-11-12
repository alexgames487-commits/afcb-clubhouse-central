import { Crest, Trend } from "./ui";
import { demoStandings, demoPlayers, demoTransfers, clubById, playerById, coins, type DemoPlayer } from "@/lib/demo-data";

export function StandingsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2 pr-2">#</th><th>Clube</th><th className="text-center">P</th><th className="text-center">J</th><th className="text-center">V</th><th className="text-center">E</th><th className="text-center">D</th><th className="text-center">SG</th></tr></thead>
        <tbody>
          {demoStandings.map((r, i) => (
            <tr key={r.club.id} className="border-t border-border">
              <td className="py-2.5 pr-2"><span className={i < 2 ? "font-bold text-primary" : "text-muted-foreground"}>{i + 1}</span></td>
              <td><div className="flex items-center gap-2"><Crest club={r.club} size="sm" /><span className="truncate">{r.club.name}</span></div></td>
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Jogador</th><th>Pos.</th><th>Clube</th><th className="text-center">Nota</th><th className="text-center">G</th><th className="text-center">A</th>{showValue && <th className="text-right">Valor</th>}</tr></thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-t border-border">
              <td className="py-2.5"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.platformId}</p></td>
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
  );
}

export function TransfersTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
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
    </div>
  );
}
