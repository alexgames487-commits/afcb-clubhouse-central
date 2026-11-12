import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/afcb/ui";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/auth")({ head: () => seo("Entrar", "Acesse sua conta AFCB ou cadastre-se."), component: Page });

function Page() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState("");
  const [type, setType] = useState<"player" | "club_manager">("player");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) toast.error("E-mail ou senha inválidos."); else nav({ to: "/painel" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin, data: { display_name: name, account_type: type } } });
      if (error) toast.error(error.message); else toast.success("Confirme seu cadastro pelo link enviado ao seu e-mail.");
    }
    setBusy(false);
  };
  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Não foi possível entrar com Google."); else if (!r.redirected) nav({ to: "/painel" });
  };
  return (
    <div className="grid-lines grid min-h-screen place-items-center p-4">
      <div className="surface w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-6 text-3xl font-bold">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "up" && <>
            <div><Label>Nome esportivo</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">{(["player", "club_manager"] as const).map((t) => <Button key={t} type="button" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>{t === "player" ? "Jogador" : "Gestor do Clube"}</Button>)}</div>
          </>}
          <div><Label>E-mail</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Senha</Label><Input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <Button className="w-full" disabled={busy}>{mode === "in" ? "Entrar" : "Cadastrar"}</Button>
        </form>
        <Button variant="outline" className="mt-3 w-full" onClick={google}>Continuar com Google</Button>
        <button className="mt-4 w-full text-sm text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}</button>
      </div>
    </div>
  );
}
