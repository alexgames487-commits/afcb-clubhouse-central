import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader } from "@/components/afcb/ui";
import { ClubDirectory } from "@/components/afcb/club-directory";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/clubes")({ head: () => seo("Clubes filiados", "Clubes de Pro Clubs Old Gen filiados à AFCB."), component: Page });

function Page() {
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="Filiados" title="Clubes" description="Clubes registrados e homologados pela federação." demo />
      <ClubDirectory />
    </Container></PublicLayout>
  );
}
