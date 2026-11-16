import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/afcb/ui";
import { supabase } from "@/integrations/supabase/client";
import { getSetupStatus, registerClub, requestAccessReset, setupSuperadmin } from "@/lib/afcb.functions";
import { afcbIdError, normalizeAfcbId, AFCB_DOMAIN } from "@/lib/afcb-id";
import { homeForRoles, type AppRole } from "@/lib/roles";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/auth")({ head: () => seo("Entrar na AFCB", "Acesse sua conta com o identificador AFCB ou cadastre sua equipe na federação."), component: Page });

type Mode = "in" | "club" | "reset" | "setup";
const msg = (e: unknown) => (e instanceof Error ? e.message : "Não foi possível concluir. Tente novamente.");

function Field({ id, label, hint, ...props }: { id: string; label: string; hint?: string } & React.ComponentProps<typeof Input>) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} name={id} className="mt-1.5" {...props} />{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}

function Page() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>("in");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const setupStatus = useQuery({ queryKey: ["setup-status"], queryFn: useServerFn(getSetupStatus) });
  const register = useServerFn(registerClub), reset = useServerFn(requestAccessReset), setup = useServerFn(setupSuperadmin);

  const run = (fn: (f: Record<string, string>) => Promise<void>) => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    try { await fn(f); } catch (err) { toast.error(msg(err)); } finally { setBusy(false); }
  };

  const signIn = run(async (f) => {
    const id = f["afcbId"] ?? "";
    const err = afcbIdError(id); if (err) throw new Error(err);
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeAfcbId(id), password: f["password"] ?? "" });
    if (error || !data.user) throw new Error(error?.message.toLowerCase().includes("banned") ? "Esta conta está suspensa. Solicite análise à administração." : "Identificador AFCB ou senha inválidos.");
    const { data: rows } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    await qc.invalidateQueries({ queryKey: ["auth-session"] });
    nav({ to: homeForRoles((rows ?? []).map((r) => r.role as AppRole)) });
  });

  const club = run(async (f) => {
    const r = await register({ data: { name: f["name"] ?? "", shortName: f["shortName"] ?? "", abbreviation: f["abbreviation"] ?? "", description: f["description"] || undefined, responsibleName: f["responsibleName"] ?? "", contactInfo: f["contactInfo"] ?? "", afcbId: f["afcbId"] ?? "", password: f["password"] ?? "", passwordConfirmation: f["passwordConfirmation"] ?? "" } });
    setCreated(r.afcbId); toast.success("Equipe cadastrada. Aguarde a aprovação da administração.");
  });

  const resetReq = run(async (f) => {
    await reset({ data: { afcbId: f["afcbId"] ?? "", contactInfo: f["contactInfo"] ?? "", identityDetails: f["identityDetails"] ?? "" } });
    toast.success("Solicitação enviada. A administração analisará e entrará em contato."); setMode("in");
  });

  const install = run(async (f) => {
    const r = await setup({ data: { displayName: f["displayName"] ?? "", afcbId: f["afcbId"] ?? "", password: f["password"] ?? "", passwordConfirmation: f["passwordConfirmation"] ?? "", installationKey: f["installationKey"] ?? "" } });
    await setupStatus.refetch(); setCreated(r.afcbId); toast.success("Superadministrador criado. Entre com o novo identificador.");
  });

  const idHint = `Exemplo: sua-equipe${AFCB_DOMAIN}. Também aceitamos apenas a parte antes de ${AFCB_DOMAIN}.`;
  const tabs: [Mode, string][] = [["in", "Entrar"], ["club", "Cadastrar equipe"], ["reset", "Recuperar acesso"], ...(setupStatus.data?.needsSetup ? [["setup", "Instalação"] as [Mode, string]] : [])];

  return (
    <div className="grid-lines grid min-h-screen place-items-center p-4">
      <div className="surface w-full max-w-lg p-6 sm:p-8">
        <Link to="/" aria-label="Voltar ao site"><Logo /></Link>
        <div role="tablist" className="mt-6 flex flex-wrap gap-2">{tabs.map(([m, l]) => <Button key={m} role="tab" aria-selected={mode === m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => { setMode(m); setCreated(null); }}>{l}</Button>)}</div>
        {created ? (
          <div className="mt-6 space-y-4" role="status">
            <h1 className="text-2xl font-bold">Conta criada</h1>
            <p className="text-muted-foreground">Seu identificador de acesso é:</p>
            <p className="rounded-md border border-primary/40 bg-primary/10 p-3 font-mono text-lg text-primary">{created}</p>
            {mode === "club" && <p className="text-sm text-muted-foreground">Você já pode entrar no painel do gestor. A equipe aparecerá no site público após a aprovação.</p>}
            <Button className="w-full" onClick={() => { setMode("in"); setCreated(null); }}>Ir para o login</Button>
          </div>
        ) : mode === "in" ? (
          <form onSubmit={signIn} className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold">Entrar</h1>
            <Field id="afcbId" label="Identificador AFCB" autoComplete="username" required hint={idHint} />
            <Field id="password" label="Senha" type="password" autoComplete="current-password" required />
            <Button className="w-full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</Button>
          </form>
        ) : mode === "club" ? (
          <form onSubmit={club} className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold">Cadastrar equipe</h1>
            <Field id="name" label="Nome da equipe" required minLength={2} maxLength={100} />
            <div className="grid gap-4 sm:grid-cols-2"><Field id="shortName" label="Nome curto" required minLength={2} maxLength={40} /><Field id="abbreviation" label="Sigla" required minLength={2} maxLength={5} hint="2 a 5 letras ou números" /></div>
            <div><Label htmlFor="description">Descrição (opcional)</Label><Textarea id="description" name="description" maxLength={1200} className="mt-1.5" /></div>
            <Field id="responsibleName" label="Nome do responsável" required minLength={2} />
            <Field id="contactInfo" label="Contato (Discord, WhatsApp ou outro)" required minLength={3} />
            <Field id="afcbId" label="Identificador AFCB desejado" required hint={idHint} />
            <div className="grid gap-4 sm:grid-cols-2"><Field id="password" label="Senha" type="password" autoComplete="new-password" required minLength={8} /><Field id="passwordConfirmation" label="Confirmar senha" type="password" autoComplete="new-password" required minLength={8} /></div>
            <Button className="w-full" disabled={busy}>{busy ? "Enviando…" : "Cadastrar equipe"}</Button>
          </form>
        ) : mode === "reset" ? (
          <form onSubmit={resetReq} className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold">Recuperar acesso</h1>
            <p className="text-sm text-muted-foreground">Não há envio de e-mail. A administração confere sua identidade e define uma nova senha.</p>
            <Field id="afcbId" label="Identificador AFCB" required />
            <Field id="contactInfo" label="Contato para retorno" required minLength={3} />
            <div><Label htmlFor="identityDetails">Como comprovar que a conta é sua</Label><Textarea id="identityDetails" name="identityDetails" required minLength={10} maxLength={1500} className="mt-1.5" placeholder="Equipe, ID da plataforma, responsável…" /></div>
            <Button className="w-full" disabled={busy}>Enviar solicitação</Button>
          </form>
        ) : (
          <form onSubmit={install} className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold">Instalação inicial</h1>
            <p className="text-sm text-muted-foreground">Cria o único Superadministrador. Requer a chave de instalação configurada pela federação e só pode ser usada uma vez.</p>
            <Field id="displayName" label="Nome" required minLength={2} />
            <Field id="afcbId" label="Identificador AFCB" required hint={idHint} />
            <div className="grid gap-4 sm:grid-cols-2"><Field id="password" label="Senha" type="password" autoComplete="new-password" required minLength={8} /><Field id="passwordConfirmation" label="Confirmar senha" type="password" autoComplete="new-password" required minLength={8} /></div>
            <Field id="installationKey" label="Chave de instalação" type="password" required />
            <Button className="w-full" disabled={busy}>Criar Superadministrador</Button>
          </form>
        )}
        <Button asChild variant="ghost" className="mt-4 w-full"><Link to="/demonstracao">Conhecer os painéis de exemplo</Link></Button>
      </div>
    </div>
  );
}
