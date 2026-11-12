import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel, EmptyState } from "@/components/afcb/ui";
import { PlayersTable } from "@/components/afcb/tables";
import { demoNews, demoFixtures, clubById } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

void Panel; void EmptyState; void PlayersTable; void demoNews; void demoFixtures; void clubById;
export const Route = createFileRoute("/calendario")({ head: () => seo("Calendário", "Calendário esportivo das competições AFCB."), component: Page });

function Page() {
  return (
    <PublicLayout><Container>
      <PageHeader title="Calendário" description="Calendário esportivo das competições AFCB." demo={true} />
      <Panel><ul className="divide-y divide-border">{demoFixtures.map((x, i) => <li key={i} className="flex justify-between py-3 text-sm"><span>{x.date}</span><span>{clubById(x.home).name} vs {clubById(x.away).name}</span><span>{x.time}</span></li>)}</ul></Panel>
    </Container></PublicLayout>
  );
}
