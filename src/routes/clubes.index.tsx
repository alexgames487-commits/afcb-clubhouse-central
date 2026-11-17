import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader } from "@/components/afcb/ui";
import { ClubDirectory } from "@/components/afcb/club-directory";
import { RealClubList } from "@/components/afcb/real-clubs";
import { listPublicClubs } from "@/lib/afcb.functions";
import { seo } from "@/lib/seo";

const clubsQuery = queryOptions({ queryKey: ["public-clubs"], queryFn: () => listPublicClubs() });

export const Route = createFileRoute("/clubes/")({
  head: () => seo("Clubes filiados", "Clubes de Pro Clubs Old Gen filiados à AFCB."),
  loader: ({ context }) => context.queryClient.ensureQueryData(clubsQuery),
  errorComponent: () => <div role="alert" className="p-8">Não foi possível carregar as equipes. Atualize a página.</div>,
  notFoundComponent: () => <div className="p-8">Página não encontrada.</div>,
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(clubsQuery);
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="Filiados" title="Clubes" description="Equipes cadastradas e aprovadas pela federação." />
      <RealClubList clubs={data} />
      <div className="mt-14"><PageHeader eyebrow="Exemplo" title="Clubes de exemplo" description="Dados ilustrativos para conhecer a plataforma." demo /><ClubDirectory /></div>
    </Container></PublicLayout>
  );
}
