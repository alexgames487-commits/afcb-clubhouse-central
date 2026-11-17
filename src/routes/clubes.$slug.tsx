import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { ClubCrestImage } from "@/components/afcb/real-clubs";
import { Button } from "@/components/ui/button";
import { getPublicClub } from "@/lib/afcb.functions";

const clubQuery = (slug: string) => queryOptions({ queryKey: ["public-club", slug], queryFn: () => getPublicClub({ data: { slug } }) });

export const Route = createFileRoute("/clubes/$slug")({
  loader: async ({ context, params }) => {
    if (!/^[a-z0-9-]+$/.test(params.slug)) throw notFound();
    const r = await context.queryClient.ensureQueryData(clubQuery(params.slug));
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.club.name} — AFCB` : "Equipe — AFCB";
    const d = loaderData?.club.description?.slice(0, 150) || "Página pública da equipe filiada à AFCB.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }] };
  },
  errorComponent: () => <div role="alert" className="p-8">Não foi possível carregar a equipe.</div>,
  notFoundComponent: () => <PublicLayout><Container><h1 className="text-3xl">Equipe não encontrada</h1><p className="mt-2 text-muted-foreground">Ela pode não existir ou ainda aguardar aprovação.</p><Button asChild className="mt-4"><Link to="/clubes">Ver clubes</Link></Button></Container></PublicLayout>,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(clubQuery(slug));
  if (!data) return null;
  const { club, players } = data;
  return (
    <PublicLayout><Container>
      <div className="surface flex flex-col gap-5 p-6 sm:flex-row sm:items-center"><ClubCrestImage club={club} size={96} /><div className="min-w-0"><p className="text-xs uppercase tracking-wider text-primary">{club.abbreviation} · {club.platform}</p><h1 className="text-4xl font-bold">{club.name}</h1>{club.short_name && <p className="text-muted-foreground">{club.short_name}</p>}</div></div>
      {club.description && <p className="surface mt-6 whitespace-pre-line p-6">{club.description}</p>}
      <section className="mt-8"><h2 className="mb-4 text-2xl">Elenco ({players.length})</h2>
        {players.length ? <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{players.map((p) => <li key={p.id} className="surface flex items-center justify-between p-4"><span className="font-semibold">{p.sport_name}</span><span className="text-sm text-muted-foreground">{p.position ?? "—"}</span></li>)}</ul> : <p className="text-muted-foreground">Elenco ainda não cadastrado.</p>}
      </section>
      <Button asChild variant="outline" className="mt-8"><Link to="/clubes">Voltar aos clubes</Link></Button>
    </Container></PublicLayout>
  );
}
