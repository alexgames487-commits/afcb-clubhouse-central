import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Shield, Users, Clock, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel, StatCard } from "./ui";
import { supabase } from "@/integrations/supabase/client";
import * as fx from "@/lib/afcb.functions";
import { clubStatusLabels, type ClubDTO, type PlayerDTO } from "@/lib/afcb-id";
import { coins } from "@/lib/demo-data";
import { roleLabel, type AppRole } from "@/lib/roles";

const fields = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); return Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; };
const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Não foi possível concluir.");
function useAction<T>(fn: (v: T) => Promise<unknown>, keys: string[], ok: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => { toast.success(ok); keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); }, onError: (e) => toast.error(errMsg(e)) });
}
function F({ id, label, ...p }: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} name={id} className="mt-1.5" {...p} /></div>;
}
function Loading({ q, children }: { q: { isPending: boolean; error: unknown }; children: ReactNode }) {
  if (q.isPending) return <p role="status" className="text-muted-foreground">Carregando…</p>;
  if (q.error) return <p role="alert" className="text-destructive">{errMsg(q.error)}</p>;
  return <>{children}</>;
}
export function LiveCrest({ club, size = "h-12 w-12" }: { club: Pick<ClubDTO, "crest_display_url" | "abbreviation" | "short_name">; size?: string }) {
  return club.crest_display_url
    ? <img src={club.crest_display_url} alt={`Escudo ${club.short_name}`} className={`${size} shrink-0 rounded-md object-contain`} />
    : <span className={`club-crest grid ${size} shrink-0 place-items-center bg-primary/15 font-display text-xs font-bold text-primary`}>{club.abbreviation ?? "AF"}</span>;
}
const statusTone: Record<string, string> = { pending: "bg-gold/15 text-gold", approved: "bg-success/15 text-success", rejected: "bg-destructive/15 text-destructive", suspended: "bg-muted text-muted-foreground" };
function ClubStatus({ status }: { status: string }) { return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[status] ?? ""}`}>{clubStatusLabels[status] ?? status}</span>; }

/* ---------------- Superadmin ---------------- */
export function AdminLiveDashboard() {
  const clubs = useQuery({ queryKey: ["admin-clubs"], queryFn: useServerFn(fx.listAdminClubs) });
  const accounts = useQuery({ queryKey: ["admin-accounts"], queryFn: useServerFn(fx.listAdminAccounts) });
  const pending = clubs.data?.filter((c) => c.status === "pending") ?? [];
  return <Panel title="Dados oficiais da federação"><div className="grid gap-4 sm:grid-cols-3">
    <StatCard label="Equipes cadastradas" value={clubs.data?.length ?? "—"} icon={Shield} />
    <StatCard label="Aguardando aprovação" value={pending.length} icon={Clock} tone="gold" />
    <StatCard label="Contas ativas" value={accounts.data?.filter((a) => a.account_status === "active").length ?? "—"} icon={Users} tone="success" />
  </div>{pending.length > 0 && <Button asChild className="mt-4"><Link to="/admin" search={{ section: "clubes" }}>Revisar {pending.length} cadastro(s)</Link></Button>}</Panel>;
}

export function AdminClubs() {
  const clubs = useQuery({ queryKey: ["admin-clubs"], queryFn: useServerFn(fx.listAdminClubs) });
  const create = useAction(useServerFn(fx.adminCreateClub), ["admin-clubs", "admin-accounts"], "Equipe criada e aprovada.");
  const [open, setOpen] = useState(false);
  return <div className="space-y-6">
    <PageHeader title="Equipes" description="Aprove, rejeite, suspenda e edite as equipes filiadas." actions={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button>Nova equipe</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Cadastrar equipe aprovada</DialogTitle></DialogHeader>
      <form className="space-y-3" onSubmit={(e) => { const f = fields(e); create.mutate({ data: { name: f["name"] ?? "", shortName: f["shortName"] ?? "", abbreviation: f["abbreviation"] ?? "", description: f["description"] || undefined, responsibleName: f["responsibleName"] ?? "", contactInfo: f["contactInfo"] ?? "", afcbId: f["afcbId"] ?? "", password: f["password"] ?? "", passwordConfirmation: f["password"] ?? "" } }, { onSuccess: () => setOpen(false) }); }}>
        <F id="name" label="Nome" required /><div className="grid grid-cols-2 gap-3"><F id="shortName" label="Nome curto" required /><F id="abbreviation" label="Sigla" required maxLength={5} /></div>
        <F id="responsibleName" label="Responsável" required /><F id="contactInfo" label="Contato" required /><F id="afcbId" label="Identificador AFCB do gestor" required /><F id="password" label="Senha inicial" type="password" minLength={8} required />
        <Button className="w-full" disabled={create.isPending}>Criar</Button></form></DialogContent></Dialog>} />
    <Loading q={clubs}>{clubs.data?.length ? <div className="grid gap-4 lg:grid-cols-2">{clubs.data.map((c) => <AdminClubCard key={c.id} club={c} />)}</div> : <EmptyState title="Nenhuma equipe cadastrada" text="Os cadastros enviados pelo site aparecerão aqui." />}</Loading>
  </div>;
}
function AdminClubCard({ club }: { club: ClubDTO }) {
  const update = useAction(useServerFn(fx.adminUpdateClub), ["admin-clubs"], "Equipe atualizada.");
  const set = (status: "approved" | "rejected" | "suspended" | "pending", extra: Partial<{ name: string; shortName: string; abbreviation: string; description: string; reviewNotes: string }> = {}) =>
    update.mutate({ data: { id: club.id, name: club.name, shortName: club.short_name ?? "", abbreviation: club.abbreviation ?? "AFC", description: club.description ?? "", status, reviewNotes: club.review_notes ?? undefined, ...extra } });
  return <article className="rounded-lg border border-border bg-card p-5">
    <div className="flex items-start gap-3"><LiveCrest club={club} /><div className="min-w-0 flex-1"><h3 className="truncate text-lg font-semibold">{club.name}</h3><p className="text-xs text-muted-foreground">{club.manager_afcb_id ?? "Sem gestor"} · {club.player_count ?? 0} jogadores</p></div><ClubStatus status={club.status} /></div>
    <p className="mt-3 text-sm text-muted-foreground">Responsável: {club.responsible_name} · {club.contact_info}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {club.status !== "approved" && <Button size="sm" disabled={update.isPending} onClick={() => set("approved")}>Aprovar</Button>}
      {club.status === "pending" && <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => set("rejected")}>Rejeitar</Button>}
      {club.status === "approved" && <Button size="sm" variant="outline" disabled={update.isPending} onClick={() => set("suspended")}>Suspender</Button>}
      <Dialog><DialogTrigger asChild><Button size="sm" variant="ghost">Editar</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Editar {club.name}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { const f = fields(e); set(club.status as "approved", { name: f["name"] ?? "", shortName: f["shortName"] ?? "", abbreviation: f["abbreviation"] ?? "", description: f["description"] ?? "", reviewNotes: f["reviewNotes"] ?? "" }); }}>
          <F id="name" label="Nome" defaultValue={club.name} required /><div className="grid grid-cols-2 gap-3"><F id="shortName" label="Nome curto" defaultValue={club.short_name ?? ""} required /><F id="abbreviation" label="Sigla" defaultValue={club.abbreviation ?? ""} required /></div>
          <div><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" defaultValue={club.description ?? ""} /></div>
          <div><Label htmlFor="reviewNotes">Observações internas</Label><Textarea id="reviewNotes" name="reviewNotes" defaultValue={club.review_notes ?? ""} /></div>
          <Button className="w-full" disabled={update.isPending}>Salvar</Button></form></DialogContent></Dialog>
    </div>
  </article>;
}

export function AdminAccounts() {
  const accounts = useQuery({ queryKey: ["admin-accounts"], queryFn: useServerFn(fx.listAdminAccounts) });
  const create = useAction(useServerFn(fx.adminCreateAccount), ["admin-accounts"], "Conta criada.");
  const status = useAction(useServerFn(fx.adminSetAccountStatus), ["admin-accounts"], "Acesso atualizado.");
  const reset = useAction(useServerFn(fx.adminResetPassword), ["admin-oversight"], "Senha redefinida.");
  const [role, setRole] = useState<AppRole>("player");
  return <div className="space-y-6">
    <PageHeader title="Usuários e permissões" description="Crie contas, suspenda acessos e redefina senhas." actions={<Dialog><DialogTrigger asChild><Button>Nova conta</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Criar conta</DialogTitle></DialogHeader>
      <form className="space-y-3" onSubmit={(e) => { const f = fields(e); create.mutate({ data: { displayName: f["displayName"] ?? "", afcbId: f["afcbId"] ?? "", password: f["password"] ?? "", role, contactInfo: f["contactInfo"] || undefined } }); }}>
        <F id="displayName" label="Nome" required /><F id="afcbId" label="Identificador AFCB" required /><F id="password" label="Senha inicial" type="password" minLength={8} required /><F id="contactInfo" label="Contato (opcional)" />
        <div className="flex flex-wrap gap-2">{(["player", "club_manager", "superadmin"] as const).map((r) => <Button key={r} type="button" size="sm" variant={role === r ? "default" : "outline"} onClick={() => setRole(r)}>{roleLabel[r]}</Button>)}</div>
        <Button className="w-full" disabled={create.isPending}>Criar conta</Button></form></DialogContent></Dialog>} />
    <Loading q={accounts}><div className="space-y-3">{accounts.data?.map((a) => <article key={a.id} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1"><p className="font-semibold">{a.display_name ?? "Sem nome"} <span className="font-mono text-sm text-primary">{a.afcb_id}</span></p><p className="text-xs text-muted-foreground">{a.roles.map((r) => roleLabel[r]).join(", ") || "Sem função"}{a.club_name ? ` · ${a.club_name}` : ""} · {a.account_status === "active" ? "Ativa" : "Suspensa"}</p></div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={status.isPending} onClick={() => status.mutate({ data: { userId: a.id, status: a.account_status === "active" ? "suspended" : "active" } })}>{a.account_status === "active" ? "Suspender" : "Reativar"}</Button>
        <Dialog><DialogTrigger asChild><Button size="sm" variant="ghost">Redefinir senha</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nova senha para {a.afcb_id}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => { const f = fields(e); reset.mutate({ data: { userId: a.id, newPassword: f["newPassword"] ?? "" } }); }}><F id="newPassword" label="Nova senha" type="password" minLength={8} required /><Button className="w-full" disabled={reset.isPending}>Redefinir</Button></form></DialogContent></Dialog>
      </div></article>)}</div></Loading>
  </div>;
}

export function AdminOversight() {
  const q = useQuery({ queryKey: ["admin-oversight"], queryFn: useServerFn(fx.listAdminOversight) });
  const accounts = useQuery({ queryKey: ["admin-accounts"], queryFn: useServerFn(fx.listAdminAccounts) });
  const reset = useAction(useServerFn(fx.adminResetPassword), ["admin-oversight"], "Senha redefinida e solicitação concluída.");
  const reject = useAction(useServerFn(fx.adminRejectResetRequest), ["admin-oversight"], "Solicitação recusada.");
  const open = q.data?.requests.filter((r) => r.status === "pending") ?? [];
  return <div className="space-y-8">
    <PageHeader title="Configurações e auditoria" description="Solicitações de recuperação de acesso e histórico de ações administrativas." />
    <Loading q={q}>
      <Panel title={`Recuperação de acesso (${open.length})`}>{open.length ? <div className="space-y-3">{open.map((r) => { const acc = accounts.data?.find((a) => a.afcb_id === r.afcb_id); return <article key={r.id} className="rounded-md border border-border p-4">
        <p className="font-mono text-primary">{r.afcb_id}</p><p className="text-sm">Contato: {r.contact_info}</p><p className="mt-1 text-sm text-muted-foreground">{r.identity_details}</p>
        {!acc && <p className="mt-2 text-xs text-destructive">Nenhuma conta encontrada com este identificador.</p>}
        <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={(e) => { const f = fields(e); if (acc) reset.mutate({ data: { userId: acc.id, newPassword: f["np"] ?? "", requestId: r.id } }); }}>
          <div className="min-w-48 flex-1"><Label htmlFor={`np-${r.id}`}>Nova senha</Label><Input id={`np-${r.id}`} name="np" type="password" minLength={8} required disabled={!acc} /></div>
          <Button size="sm" disabled={!acc || reset.isPending}>Redefinir</Button><Button size="sm" type="button" variant="outline" onClick={() => reject.mutate({ data: { requestId: r.id } })}>Recusar</Button></form></article>; })}</div> : <EmptyState title="Nenhuma solicitação pendente" text="Pedidos enviados pela página de login aparecerão aqui." />}</Panel>
      <Panel title="Histórico de auditoria">{q.data?.logs.length ? <ul className="divide-y divide-border text-sm">{q.data.logs.map((l) => <li key={l.id} className="flex flex-wrap justify-between gap-2 py-2"><span className="font-mono text-xs text-primary">{l.action}</span><span className="text-muted-foreground">{new Date(l.created_at).toLocaleString("pt-BR")}</span></li>)}</ul> : <EmptyState title="Sem registros" text="As ações administrativas serão registradas aqui." />}</Panel>
    </Loading>
  </div>;
}

/* ---------------- Club manager ---------------- */
export function ManagerClub({ roster = false }: { roster?: boolean }) {
  const q = useQuery({ queryKey: ["manager-club"], queryFn: useServerFn(fx.getManagerClub) });
  return <Loading q={q}>{!q.data?.club ? <EmptyState title="Nenhuma equipe vinculada" text="Sua conta ainda não está vinculada a uma equipe. Solicite à administração." /> : roster ? <Roster club={q.data.club} players={q.data.players} /> : <ClubProfile club={q.data.club} players={q.data.players} />}</Loading>;
}
function ClubProfile({ club, players }: { club: ClubDTO; players: PlayerDTO[] }) {
  const update = useAction(useServerFn(fx.managerUpdateClub), ["manager-club"], "Dados da equipe salvos.");
  const [uploading, setUploading] = useState(false);
  const save = (crestUrl: string | null, f?: Record<string, string>) => update.mutate({ data: { id: club.id, shortName: f?.["shortName"] ?? club.short_name ?? "", abbreviation: f?.["abbreviation"] ?? club.abbreviation ?? "AFC", description: f?.["description"] ?? club.description ?? "", responsibleName: f?.["responsibleName"] ?? club.responsible_name ?? "", contactInfo: f?.["contactInfo"] ?? club.contact_info ?? "", crestUrl } });
  const upload = async (file: File): Promise<void> => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2_000_000) { toast.error("Use PNG, JPG ou WEBP de até 2 MB."); return; }
    setUploading(true);
    const { data: u } = await supabase.auth.getUser();
    const path = `${u.user?.id}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("club-crests").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) { toast.error("Não foi possível enviar o escudo."); return; }
    save(path);
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center gap-4"><LiveCrest club={club} size="h-20 w-20" /><div className="min-w-0"><h2 className="text-3xl font-bold">{club.name}</h2><div className="mt-1 flex items-center gap-2"><ClubStatus status={club.status} /><span className="text-sm text-muted-foreground">{players.length} jogadores</span></div></div></div>
    {club.status === "pending" && <p role="status" className="rounded-md border border-gold/40 bg-gold/10 p-3 text-sm">Cadastro em análise. A equipe aparecerá no site após a aprovação.</p>}
    <div className="grid gap-4 sm:grid-cols-2"><StatCard label="Patrimônio (AFCB Coins)" value={coins(club.coins)} tone="gold" /><StatCard label="Valor do elenco" value={coins(players.reduce((s, p) => s + Number(p.market_value), 0))} /></div>
    <Panel title="Perfil da equipe">
      <div className="mb-4"><Label htmlFor="crest">Escudo</Label><Input id="crest" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} className="mt-1.5" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} /></div>
      <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => save(club.crest_url, fields(e))}>
        <F id="shortName" label="Nome curto" defaultValue={club.short_name ?? ""} required /><F id="abbreviation" label="Sigla" defaultValue={club.abbreviation ?? ""} required maxLength={5} />
        <F id="responsibleName" label="Responsável" defaultValue={club.responsible_name ?? ""} required /><F id="contactInfo" label="Contato" defaultValue={club.contact_info ?? ""} required />
        <div className="sm:col-span-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" defaultValue={club.description ?? ""} /></div>
        <Button className="sm:col-span-2" disabled={update.isPending}>Salvar alterações</Button></form>
    </Panel>
  </div>;
}
function Roster({ club, players }: { club: ClubDTO; players: PlayerDTO[] }) {
  const add = useAction(useServerFn(fx.managerAddPlayer), ["manager-club"], "Jogador adicionado.");
  const del = useAction(useServerFn(fx.managerDeletePlayer), ["manager-club"], "Jogador removido.");
  return <div className="space-y-6">
    <Panel title={`Elenco oficial — ${club.short_name}`}>
      <form className="grid gap-3 sm:grid-cols-[2fr_1.5fr_1fr_1fr_auto] sm:items-end" onSubmit={(e) => { const f = fields(e); add.mutate({ data: { clubId: club.id, sportName: f["sportName"] ?? "", platformId: f["platformId"] || undefined, position: f["position"] || undefined, marketValue: Number(f["marketValue"] || 0) } }, { onSuccess: () => (e.target as HTMLFormElement).reset() }); }}>
        <F id="sportName" label="Nome esportivo" required minLength={2} /><F id="platformId" label="ID da plataforma" /><F id="position" label="Posição" maxLength={20} /><F id="marketValue" label="Valor" type="number" min={0} defaultValue={0} /><Button disabled={add.isPending}>Adicionar</Button>
      </form>
    </Panel>
    {players.length ? <ul className="space-y-2">{players.map((p) => <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{p.sport_name}</p><p className="text-xs text-muted-foreground">{p.position ?? "—"} · {p.platform_id ?? "sem ID"} · {coins(Number(p.market_value))}</p></div><Button size="sm" variant="ghost" disabled={del.isPending} onClick={() => del.mutate({ data: { id: p.id, clubId: club.id } })}>Remover</Button></li>)}</ul> : <EmptyState title="Elenco vazio" text="Adicione os jogadores da equipe acima." />}
  </div>;
}

/* ---------------- Player ---------------- */
export function PlayerAccount() {
  const q = useQuery({ queryKey: ["player-account"], queryFn: useServerFn(fx.getPlayerAccount) });
  return <Loading q={q}><Panel title="Minha conta"><div className="flex items-center gap-3"><UserCog className="h-8 w-8 text-primary" /><div><p className="font-semibold">{q.data?.profile?.display_name ?? "Jogador"}</p><p className="font-mono text-sm text-primary">{q.data?.profile?.afcb_id}</p></div></div>
    {q.data?.player ? <p className="mt-3 text-sm">Registrado como <strong>{q.data.player.sport_name}</strong> · {coins(Number(q.data.player.market_value))}</p> : <p className="mt-3 text-sm text-muted-foreground">Seu perfil ainda não foi vinculado a um elenco oficial.</p>}</Panel></Loading>;
}
