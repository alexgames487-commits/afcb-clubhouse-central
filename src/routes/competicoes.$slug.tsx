import { createFileRoute, notFound } from "@tanstack/react-router";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel, Crest, StatusPill, EmptyState } from "@/components/afcb/ui";
import { StandingsTable, PlayersTable } from "@/components/afcb/tables";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoCompetitions, demoClubs, demoFixtures, demoPlayers, clubById } from "@/lib/demo-data";

export const Route = createFileRoute("/competicoes/$slug")({
  loader: ({ params }) => {
    const comp = demoCompetitions.find((c) => c.slug === params.slug);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.comp.name} | AFCB` },
      { name: "description", content: `Tabela, rodadas, resultados e estatísticas — ${loaderData.comp.name}.` },
      { property: "og:title", content: `${loaderData.comp.name} | AFCB` },
      { property: "og:description", content: `Competição AFCB: ${loaderData.comp.format}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] : [{ title: "Competição indisponível | AFCB" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

const tabs = ["Classificação", "Participantes", "Rodadas", "Resultados", "Súmulas", "Artilharia", "Assistências", "Estatísticas", "Premiações", "Regulamento"];

function Page() {
  const { comp } = Route.useLoaderData();
  const scorers = [...demoPlayers].sort((a, b) => b.goals - a.goals).slice(0, 8);
  const assists = [...demoPlayers].sort((a, b) => b.assists - a.assists).slice(0, 8);
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow={`${comp.format} · ${comp.season}`} title={comp.name} demo actions={<StatusPill status={comp.status} />} />
      <Tabs defaultValue={tabs[0]}>
        <TabsList className="h-auto flex-wrap justify-start">{tabs.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}</TabsList>
        <TabsContent value="Classificação"><Panel><StandingsTable /></Panel></TabsContent>
        <TabsContent value="Participantes"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{demoClubs.map((c) => <Panel key={c.id}><div className="flex items-center gap-3"><Crest club={c} /><span className="font-medium">{c.name}</span></div></Panel>)}</div></TabsContent>
        <TabsContent value="Rodadas"><Panel><ul className="divide-y divide-border">{demoFixtures.map((f, i) => <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="text-muted-foreground">{f.date}</span><span className="flex items-center gap-2"><Crest club={clubById(f.home)} size="sm" /> vs <Crest club={clubById(f.away)} size="sm" /></span><span>{f.time}</span></li>)}</ul></Panel></TabsContent>
        <TabsContent value="Resultados"><EmptyState title="Nenhum resultado oficial" text="Os resultados serão publicados pela administração após validação das súmulas." /></TabsContent>
        <TabsContent value="Súmulas"><EmptyState title="Nenhuma súmula registrada" text="As súmulas das partidas aparecerão aqui." /></TabsContent>
        <TabsContent value="Artilharia"><Panel><PlayersTable players={scorers} showValue={false} /></Panel></TabsContent>
        <TabsContent value="Assistências"><Panel><PlayersTable players={assists} showValue={false} /></Panel></TabsContent>
        <TabsContent value="Estatísticas"><EmptyState title="Estatísticas em preparação" text="Indicadores coletivos serão calculados a partir das súmulas oficiais." /></TabsContent>
        <TabsContent value="Premiações"><EmptyState title="Premiações a definir" text="Troféus e prêmios individuais serão anunciados pela AFCB." /></TabsContent>
        <TabsContent value="Regulamento"><EmptyState title="Regulamento específico pendente" text="Consulte também a página de Regulamentos gerais." /></TabsContent>
      </Tabs>
    </Container></PublicLayout>
  );
}
