import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout, Container } from "@/components/afcb/public-layout";
import { PageHeader, Panel } from "@/components/afcb/ui";
import { PlayersTable } from "@/components/afcb/tables";
import { Input } from "@/components/ui/input";
import { demoPlayers } from "@/lib/demo-data";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/jogadores")({ head: () => seo("Jogadores registrados", "Atletas registrados na AFCB com estatísticas e valor de mercado."), component: Page });

function Page() {
  const [q, setQ] = useState("");
  const list = demoPlayers.filter((p) => (p.name + p.platformId + p.position).toLowerCase().includes(q.toLowerCase()));
  return (
    <PublicLayout><Container>
      <PageHeader eyebrow="Registro" title="Jogadores" description="Atletas com registro ativo na federação." demo actions={<Input placeholder="Buscar jogador, ID ou posição" value={q} onChange={(e) => setQ(e.target.value)} className="md:w-72" />} />
      <Panel><PlayersTable players={list} /></Panel>
    </Container></PublicLayout>
  );
}
