import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database, Json } from "@/integrations/supabase/types";
import type { AppRole } from "./roles";
import { slugify } from "./afcb-id";
import type { ClubDTO } from "./afcb-id";

export type AuthContext = { supabase: SupabaseClient<Database>; userId: string };

export function createPublicReader(url: string, key: string) {
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
      if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export async function requireActive(context: AuthContext) {
  const { data, error } = await context.supabase.from("profiles").select("account_status").eq("id", context.userId).single();
  if (error || data?.account_status !== "active") throw new Error("Sua conta está suspensa ou indisponível. Solicite uma análise à administração.");
}

export async function requireSuperadmin(context: AuthContext) {
  await requireActive(context);
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "superadmin" });
  if (error || !data) throw new Error("Acesso negado: esta ação é exclusiva do Superadministrador.");
}

export async function audit(actorId: string | null, action: string, entityType: string, entityId: string | null, details: Record<string, Json | undefined> = {}) {
  const { error } = await supabaseAdmin.from("audit_log").insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, details });
  if (error) console.error("Falha ao registrar auditoria", error.message);
}

export async function signedCrest(path: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const { data, error } = await supabaseAdmin.storage.from("club-crests").createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function mapClub(club: Database["public"]["Tables"]["clubs"]["Row"], extra: { manager_afcb_id?: string | null | undefined; player_count?: number } = {}): Promise<ClubDTO> {
  return { ...club, ...extra, crest_display_url: await signedCrest(club.crest_url) };
}

type NewAccount = { afcbId: string; password: string; displayName: string; role: AppRole; contactInfo?: string | undefined };
export async function createAuthAccount(input: NewAccount) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.afcbId,
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: input.displayName, account_type: input.role === "club_manager" ? "club_manager" : "player", contact_info: input.contactInfo ?? null },
  });
  if (error || !data.user) {
    const duplicate = error?.message.toLowerCase().includes("already") || error?.message.toLowerCase().includes("duplicate");
    throw new Error(duplicate ? "Este identificador AFCB já está cadastrado." : "Não foi possível criar a conta. Revise os dados e a força da senha.");
  }
  if (input.role === "superadmin") {
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user.id);
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: data.user.id, role: "superadmin" });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      throw new Error("Não foi possível concluir a permissão administrativa.");
    }
  }
  return data.user;
}

type NewClub = {
  name: string;
  shortName: string;
  abbreviation: string;
  description?: string | undefined;
  responsibleName: string;
  contactInfo: string;
  afcbId: string;
  password: string;
  status: "pending" | "approved";
  actorId?: string | null | undefined;
};

export async function createClubWithManager(input: NewClub) {
  const user = await createAuthAccount({ afcbId: input.afcbId, password: input.password, displayName: input.responsibleName, role: "club_manager", contactInfo: input.contactInfo });
  const base = slugify(input.name);
  const { data: existing } = await supabaseAdmin.from("clubs").select("id").eq("slug", base).maybeSingle();
  const slug = existing ? `${base}-${crypto.randomUUID().slice(0, 6)}` : base;
  const { data: club, error } = await supabaseAdmin.from("clubs").insert({
    name: input.name,
    short_name: input.shortName,
    abbreviation: input.abbreviation,
    description: input.description || null,
    responsible_name: input.responsibleName,
    contact_info: input.contactInfo,
    manager_id: user.id,
    slug,
    status: input.status,
    reviewed_at: input.status === "approved" ? new Date().toISOString() : null,
    reviewed_by: input.status === "approved" ? (input.actorId ?? null) : null,
  }).select().single();
  if (error || !club) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    throw new Error("Não foi possível salvar a equipe. Verifique se os dados são únicos e tente novamente.");
  }
  await audit(input.actorId ?? user.id, input.status === "pending" ? "club.registration_requested" : "club.created_by_admin", "club", club.id, { name: club.name, afcb_id: input.afcbId, status: club.status });
  return { club, user };
}
