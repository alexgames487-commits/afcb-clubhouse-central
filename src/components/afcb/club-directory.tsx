import { Users, Coins, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { demoClubs, demoPlayers, coins } from "@/lib/demo-data";
import { Crest, DemoBadge, StatCard } from "./ui";
import { PlayersTable } from "./tables";

export function ClubDirectory() {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{demoClubs.map((club) => {
    const squad = demoPlayers.filter((p) => p.clubId === club.id);
    return <article key={club.id} className="surface overflow-hidden">
      <div className="flex min-w-0 items-center gap-4 border-b border-border p-5"><Crest club={club} size="lg" /><div className="min-w-0"><p className="mb-1 text-xs text-muted-foreground">{club.short} · Old Gen</p><h2 className="text-2xl font-semibold leading-tight">{club.name}</h2><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{club.players} jogadores de exemplo</p></div></div>
      <dl className="grid grid-cols-2 gap-3 p-5"><div><dt className="text-xs text-muted-foreground">Patrimônio</dt><dd className="mt-1 font-display text-xl font-semibold text-gold">{coins(club.coins)}</dd></div><div><dt className="text-xs text-muted-foreground">Valor do elenco</dt><dd className="mt-1 font-display text-xl font-semibold">{coins(club.squadValue)}</dd></div></dl>
      <div className="flex items-center justify-between border-t border-border px-5 py-3"><span className="text-xs text-muted-foreground">Elenco e finanças</span><Dialog><DialogTrigger asChild><Button variant="ghost" size="sm">Ver clube <ArrowUpRight /></Button></DialogTrigger><DialogContent className="profile-dialog max-w-4xl"><DialogHeader><DialogTitle className="pr-5 text-3xl">{club.name}</DialogTitle><DialogDescription>{club.short} · EA SPORTS FC 26 · Pro Clubs Old Gen</DialogDescription></DialogHeader><div className="flex items-center gap-4"><Crest club={club} size="lg" /><DemoBadge /></div><div className="grid grid-cols-2 gap-3"><StatCard label="Patrimônio" value={coins(club.coins)} tone="gold" icon={Coins} /><StatCard label="Valor do elenco" value={coins(club.squadValue)} icon={Users} /></div><div className="border-t border-border pt-5"><h3 className="mb-4 text-xl">Elenco de exemplo</h3><PlayersTable players={squad} /></div></DialogContent></Dialog></div>
    </article>;
  })}</div>;
}