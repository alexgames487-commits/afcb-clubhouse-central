import { Link } from "@tanstack/react-router";
import { Users, ArrowUpRight, Shield } from "lucide-react";
import type { ClubDTO } from "@/lib/afcb-id";

export function ClubCrestImage({ club, size = 64 }: { club: ClubDTO; size?: number }) {
  if (club.crest_display_url) return <img src={club.crest_display_url} alt={`Escudo do ${club.name}`} width={size} height={size} className="club-crest shrink-0 object-cover" style={{ width: size, height: size }} />;
  return <div className="club-crest grid shrink-0 place-items-center bg-primary/15 font-display font-bold text-primary" style={{ width: size, height: size }}>{club.abbreviation ?? <Shield />}</div>;
}

export function RealClubList({ clubs }: { clubs: ClubDTO[] }) {
  if (!clubs.length) return <p className="surface p-6 text-muted-foreground">Nenhuma equipe aprovada ainda. As equipes aparecem aqui após a aprovação da administração.</p>;
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{clubs.map((club) => (
    <article key={club.id} className="surface flex flex-col overflow-hidden">
      <div className="flex min-w-0 items-center gap-4 p-5"><ClubCrestImage club={club} /><div className="min-w-0"><p className="mb-1 text-xs text-muted-foreground">{club.abbreviation} · {club.platform}</p><h3 className="text-2xl font-semibold leading-tight">{club.name}</h3><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{club.player_count ?? 0} jogadores</p></div></div>
      {club.slug && <Link to="/clubes/$slug" params={{ slug: club.slug }} className="mt-auto flex items-center justify-between border-t border-border px-5 py-3 text-sm text-primary hover:bg-muted/40">Ver página da equipe <ArrowUpRight className="h-4 w-4" /></Link>}
    </article>))}</div>;
}
