import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel, EmptyState } from "@/components/afcb/ui";
import { PlayersTable } from "@/components/afcb/tables";
import { demoNews, demoFixtures, clubById } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

void Panel; void EmptyState; void PlayersTable; void demoNews; void demoFixtures; void clubById;
export const Route = createFileRoute("/rankings")({ head: () => seo("Rankings", "Rankings e estatísticas de jogadores e clubes."), component: Page });

function Page() {
  return (
    <PublicLayout><Container>
      <PageHeader title="Rankings" description="Rankings e estatísticas de jogadores e clubes." demo={true} />
      <Panel><PlayersTable /></Panel>
    </Container></PublicLayout>
  );
}
