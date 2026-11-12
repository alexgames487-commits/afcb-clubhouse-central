import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Trophy, Shield, Users, Coins, CalendarDays, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { Crest, DemoBadge, Panel, StatusPill, Trend } from "@/components/afcb/ui";
import { demoClubs, demoCompetitions, demoNews, demoPlayers, demoStandings, coins, clubById } from "@/lib/demo-data";
import hero from "@/assets/hero-stadium.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AFCB — Associação Federativa Clubs Brasil" },
      { name: "description", content: "Federação de clubes de EA SPORTS FC 26 Pro Clubs Old Gen: competições, clubes, jogadores e AFCB Market." },
      { property: "og:title", content: "AFCB — Associação Federativa Clubs Brasil" },
      { property: "og:description", content: "A federação oficial de Pro Clubs Old Gen do Brasil." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const pillars = [
  { icon: Trophy, title: "Competições", text: "Ligas e copas independentes com tabelas, súmulas e estatísticas.", to: "/competicoes" },
  { icon: Shield, title: "Clubes filiados", text: "Gestão de elenco, escalação e patrimônio em AFCB Coins.", to: "/clubes" },
  { icon: Users, title: "Jogadores", text: "Perfis esportivos com histórico, notas e valorização.", to: "/jogadores" },
  { icon: Coins, title: "AFCB Market", text: "Mercado BID, transferências e histórico de negociações.", to: "/mercado" },
] as const;

function Home() {
  const top = [...demoPlayers].sort((a, b) => b.value - a.value).slice(0, 5);
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="" width={1920} height={1088} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-hero" />
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 md:pt-32">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary animate-rise">EA SPORTS FC 26 · Pro Clubs · Old Gen</p>
          <h1 className="max-w-4xl text-5xl font-bold leading-[0.95] md:text-7xl animate-rise">
            Associação Federativa <span className="text-brand">Clubs Brasil</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground animate-rise">A entidade que organiza, regulamenta e administra competições, clubes, jogadores e o mercado de transferências do Pro Clubs Old Gen.</p>
          <div className="mt-8 flex flex-wrap gap-3 animate-rise">
            <Button asChild size="lg"><Link to="/auth">Filiar meu clube <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/competicoes">Ver competições</Link></Button>
          </div>
        </div>
      </section>

      <Container>
        <div className="-mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <Link key={p.to} to={p.to} className="surface group p-6 transition hover:-translate-y-0.5 hover:shadow-glow">
              <p.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">Acessar <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Panel title="Classificação" action={<DemoBadge />} className="lg:col-span-2">
            <StandingsTable />
            <Link to="/competicoes/$slug" params={{ slug: "liga-exemplo" }} className="mt-4 inline-flex items-center gap-1 text-sm text-primary">Ver competição <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Panel>
          <Panel title="Mais valorizados" action={<DemoBadge />}>
            <ul className="divide-y divide-border">
              {top.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 font-display text-lg text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.position} · {clubById(p.clubId).short}</p></div>
                  <div className="text-right"><p className="text-sm font-semibold text-gold">{coins(p.value)}</p><Trend value={p.change} /></div>
                </li>
              ))}
            </ul>
            <Link to="/mercado" className="mt-3 inline-flex items-center gap-1 text-sm text-primary">AFCB Market <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Panel title="Competições" className="lg:col-span-1" action={<DemoBadge />}>
            <ul className="space-y-3">
              {demoCompetitions.map((c) => (
                <li key={c.slug}><Link to="/competicoes/$slug" params={{ slug: c.slug }} className="flex items-center justify-between rounded-md border border-border p-3 hover:border-primary/50"><span className="text-sm font-medium">{c.name}</span><StatusPill status={c.status} /></Link></li>
              ))}
            </ul>
          </Panel>
          <Panel title="Notícias e comunicados" className="lg:col-span-2" action={<DemoBadge />}>
            <div className="grid gap-4 md:grid-cols-3">
              {demoNews.map((n) => (
                <Link key={n.id} to="/noticias" className="rounded-md border border-border p-4 hover:border-primary/50">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gold">{n.tag}</span>
                  <p className="mt-2 font-semibold leading-snug">{n.title}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[{ icon: CalendarDays, t: "Calendário esportivo", to: "/calendario" }, { icon: ScrollText, t: "Regulamentos", to: "/regulamentos" }, { icon: Trophy, t: "Rankings e estatísticas", to: "/rankings" }].map((x) => (
            <Link key={x.to} to={x.to} className="surface flex items-center gap-4 p-5 hover:shadow-glow"><x.icon className="h-5 w-5 text-gold" /><span className="font-medium">{x.t}</span><ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" /></Link>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">{demoClubs.length} clubes de exemplo exibidos para demonstração da interface.</p>
      </Container>
    </PublicLayout>
  );
}

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
