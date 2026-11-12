import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel, EmptyState } from "@/components/afcb/ui";
import { PlayersTable } from "@/components/afcb/tables";
import { demoNews, demoFixtures, clubById } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

void Panel; void EmptyState; void PlayersTable; void demoNews; void demoFixtures; void clubById;
export const Route = createFileRoute("/noticias")({ head: () => seo("Notícias", "Notícias e comunicados oficiais da AFCB."), component: Page });

function Page() {
  return (
    <PublicLayout><Container>
      <PageHeader title="Notícias" description="Notícias e comunicados oficiais da AFCB." demo={true} />
      <div className="grid gap-4 md:grid-cols-3">{demoNews.map((n) => <Panel key={n.id}><span className="text-xs text-gold">{n.tag}</span><p className="mt-2 font-semibold">{n.title}</p><p className="mt-2 text-sm text-muted-foreground">{n.excerpt}</p></Panel>)}</div>
    </Container></PublicLayout>
  );
}
