import { createFileRoute } from "@tanstack/react-router";
import { Shield, Scale, Cpu, Users } from "lucide-react";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel } from "@/components/afcb/ui";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/sobre")({ head: () => seo("Sobre a AFCB", "Conheça a missão e a estrutura da Associação Federativa Clubs Brasil."), component: Page });

const values = [
  { icon: Shield, t: "Autoridade esportiva", d: "Regulamentação clara e aplicação imparcial das regras." },
  { icon: Scale, t: "Integridade", d: "Transparência em resultados, mercado e finanças." },
  { icon: Cpu, t: "Tecnologia", d: "Plataforma própria para gestão de clubes e competições." },
  { icon: Users, t: "Comunidade", d: "Foco exclusivo na comunidade Pro Clubs Old Gen." },
];

function Page() {
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="Institucional" title="Sobre a AFCB" description="A Associação Federativa Clubs Brasil é a entidade dedicada à organização de competições de EA SPORTS FC 26 na modalidade Pro Clubs, exclusivamente na geração Old Gen." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => <Panel key={v.t}><v.icon className="h-6 w-6 text-primary" /><h3 className="mt-3 text-xl font-semibold">{v.t}</h3><p className="mt-1 text-sm text-muted-foreground">{v.d}</p></Panel>)}
      </div>
      <Panel title="Estrutura de acesso" className="mt-6">
        <div className="grid gap-4 text-sm md:grid-cols-4">
          {[["Superadministrador", "Controle total da plataforma e da federação."], ["Gestor do Clube", "Presidente e treinador: elenco, mercado e finanças do clube."], ["Jogador", "Perfil esportivo individual e histórico."], ["Visitante", "Acesso às informações públicas."]].map(([t, d]) => (
            <div key={t} className="rounded-md border border-border p-4"><p className="font-semibold text-gold">{t}</p><p className="mt-1 text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </Panel>
    </Container></PublicLayout>
  );
}
