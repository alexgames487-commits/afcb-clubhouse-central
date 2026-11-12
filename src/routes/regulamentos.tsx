import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel, EmptyState } from "@/components/afcb/ui";
import { PlayersTable } from "@/components/afcb/tables";
import { demoNews, demoFixtures, clubById } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

void Panel; void EmptyState; void PlayersTable; void demoNews; void demoFixtures; void clubById;
export const Route = createFileRoute("/regulamentos")({ head: () => seo("Regulamentos", "Regulamentos gerais da federação."), component: Page });

function Page() {
  return (
    <PublicLayout><Container>
      <PageHeader title="Regulamentos" description="Regulamentos gerais da federação." demo={false} />
      <EmptyState title="Em breve" text="Conteúdo oficial será publicado pela administração da AFCB." />
    </Container></PublicLayout>
  );
}
