import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Crest } from "@/components/afcb/ui";
import { demoClubs, coins } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/clubes")({ head: () => seo("Clubes filiados", "Clubes de Pro Clubs Old Gen filiados à AFCB."), component: Page });

function Page() {
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="Filiados" title="Clubes" description="Clubes registrados e homologados pela federação." demo />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoClubs.map((c) => (
          <div key={c.id} className="surface p-6 hover:shadow-glow">
            <div className="flex items-center gap-4"><Crest club={c} size="lg" /><div><h3 className="text-xl font-bold">{c.name}</h3><p className="text-sm text-muted-foreground">{c.players} jogadores</p></div></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Valor do elenco</p><p className="font-semibold text-gold">{coins(c.squadValue)}</p></div><div><p className="text-xs text-muted-foreground">Sigla</p><p className="font-semibold">{c.short}</p></div></div>
          </div>
        ))}
      </div>
    </Container></PublicLayout>
  );
}
