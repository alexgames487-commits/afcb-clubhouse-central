import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeAfcbId, isValidAfcbId } from "./afcb-id";
import { audit, createAuthAccount, createClubWithManager, createPublicReader, mapClub, requireActive, requireSuperadmin, signedCrest } from "./afcb.server";

const password = z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").max(72, "A senha deve ter no máximo 72 caracteres.");
const afcbId = z.string().transform((value, ctx) => {
  const normalized = normalizeAfcbId(value);
  if (!isValidAfcbId(normalized)) {
    ctx.addIssue({ code: "custom", message: "Identificador inválido. Use letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços." });
    return z.NEVER;
  }
  return normalized;
});
const clubInput = z.object({
  name: z.string().trim().min(2).max(100),
  shortName: z.string().trim().min(2).max(40),
  abbreviation: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,5}$/, "Use de 2 a 5 letras ou números na sigla."),
  description: z.string().trim().max(1200).optional(),
  responsibleName: z.string().trim().min(2).max(100),
  contactInfo: z.string().trim().min(3).max(160),
  afcbId,
  password,
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, { message: "As senhas não coincidem.", path: ["passwordConfirmation"] });
const accountInput = z.object({
  displayName: z.string().trim().min(2).max(100),
  afcbId,
  password,
  role: z.enum(["superadmin", "club_manager", "player"]),
  contactInfo: z.string().trim().max(160).optional(),
  clubId: z.string().uuid().optional(),
});

export const SUPERADMIN_ID = "superadm@afcb.com";

export const getSetupStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("installation_claims").select("id").eq("id", 1).maybeSingle();
  return { needsSetup: !data };
});

export const setupSuperadmin = createServerFn({ method: "POST" })
  .inputValidator(z.object({ displayName: z.string().trim().min(2).max(100), afcbId, password, passwordConfirmation: z.string(), installationKey: z.string().min(1) }).refine((data) => data.password === data.passwordConfirmation, { message: "As senhas não coincidem." }))
  .handler(async ({ data }) => {
    const configuredKey = process.env["AFCB_SETUP_KEY"];
    if (!configuredKey || data.installationKey !== configuredKey) throw new Error("Chave de instalação inválida.");
    if (data.afcbId !== SUPERADMIN_ID) throw new Error(`A conta principal deve usar o identificador ${SUPERADMIN_ID}.`);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: claim, error: claimError } = await supabaseAdmin.from("installation_claims").insert({ id: 1 }).select().single();
    if (claimError || !claim) throw new Error("A configuração inicial já foi utilizada.");
    try {
      const user = await createAuthAccount({ afcbId: data.afcbId, password: data.password, displayName: data.displayName, role: "superadmin" });
      await supabaseAdmin.from("installation_claims").update({ user_id: user.id }).eq("id", 1);
      await audit(user.id, "account.initial_superadmin_created", "profile", user.id, { afcb_id: data.afcbId });
      return { afcbId: data.afcbId };
    } catch (error) {
      await supabaseAdmin.from("installation_claims").delete().eq("id", 1);
      throw error;
    }
  });

export const registerClub = createServerFn({ method: "POST" })
  .inputValidator(clubInput)
  .handler(async ({ data }) => {
    const result = await createClubWithManager({ ...data, status: "pending" });
    return { afcbId: data.afcbId, clubId: result.club.id, slug: result.club.slug };
  });

export const requestAccessReset = createServerFn({ method: "POST" })
  .inputValidator(z.object({ afcbId, contactInfo: z.string().trim().min(3).max(160), identityDetails: z.string().trim().min(10).max(1500) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("access_reset_requests").insert({ afcb_id: data.afcbId, contact_info: data.contactInfo, identity_details: data.identityDetails });
    if (error) throw new Error("Não foi possível registrar a solicitação. Tente novamente.");
    return { ok: true };
  });

export const listPublicClubs = createServerFn({ method: "GET" }).handler(async () => {
  const reader = createPublicReader(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!);
  const { data, error } = await reader.from("clubs").select("*").eq("status", "approved").order("name");
  if (error) throw new Error("Não foi possível carregar as equipes.");
  const { data: players } = await reader.from("players").select("club_id");
  return Promise.all((data ?? []).map((club) => mapClub(club, { player_count: (players ?? []).filter((player) => player.club_id === club.id).length })));
});

export const getPublicClub = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }) => {
    const reader = createPublicReader(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!);
    const { data: club, error } = await reader.from("clubs").select("*").eq("slug", data.slug).eq("status", "approved").maybeSingle();
    if (error) throw new Error("Não foi possível carregar a equipe.");
    if (!club) return null;
    const { data: players } = await reader.from("players").select("*").eq("club_id", club.id).order("sport_name");
    return { club: await mapClub(club, { player_count: players?.length ?? 0 }), players: players ?? [] };
  });

export const listAdminClubs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperadmin(context);
    const [{ data: clubs, error }, { data: profiles }, { data: players }] = await Promise.all([
      context.supabase.from("clubs").select("*").is("deleted_at", null).order("submitted_at", { ascending: false }),
      context.supabase.from("profiles").select("id, afcb_id"),
      context.supabase.from("players").select("club_id"),
    ]);
    if (error) throw new Error("Não foi possível carregar as equipes.");
    return Promise.all((clubs ?? []).map((club) => mapClub(club, {
      manager_afcb_id: profiles?.find((profile) => profile.id === club.manager_id)?.afcb_id,
      player_count: (players ?? []).filter((player) => player.club_id === club.id).length,
    })));
  });

export const adminCreateClub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(clubInput)
  .handler(async ({ data, context }) => {
    await requireSuperadmin(context);
    const result = await createClubWithManager({ ...data, status: "approved", actorId: context.userId });
    return { clubId: result.club.id };
  });

export const adminUpdateClub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(), name: z.string().trim().min(2).max(100), shortName: z.string().trim().min(2).max(40),
    abbreviation: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,5}$/), description: z.string().trim().max(1200),
    status: z.enum(["pending", "approved", "rejected", "suspended"]), reviewNotes: z.string().trim().max(1000).optional(),
  }))
  .handler(async ({ data, context }) => {
    await requireSuperadmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: club, error } = await supabaseAdmin.from("clubs").update({
      name: data.name, short_name: data.shortName, abbreviation: data.abbreviation, description: data.description || null,
      status: data.status, review_notes: data.reviewNotes || null,
      reviewed_at: data.status === "pending" ? null : new Date().toISOString(), reviewed_by: context.userId,
    }).eq("id", data.id).select().single();
    if (error || !club) throw new Error("Não foi possível atualizar a equipe.");
    await audit(context.userId, "club.updated", "club", club.id, { status: club.status, name: club.name });
    return { ok: true };
  });

export const getManagerClub = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireActive(context);
    const { data: club, error } = await context.supabase.from("clubs").select("*").eq("manager_id", context.userId).maybeSingle();
    if (error) throw new Error("Não foi possível carregar sua equipe.");
    if (!club) return { club: null, players: [] };
    const { data: players, error: playersError } = await context.supabase.from("players").select("*").eq("club_id", club.id).order("sport_name");
    if (playersError) throw new Error("Não foi possível carregar o elenco.");
    return { club: await mapClub(club, { player_count: players?.length ?? 0 }), players: players ?? [] };
  });

export const managerUpdateClub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(), shortName: z.string().trim().min(2).max(40), abbreviation: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,5}$/),
    description: z.string().trim().max(1200), responsibleName: z.string().trim().min(2).max(100), contactInfo: z.string().trim().min(3).max(160), crestUrl: z.string().max(500).nullable(),
  }))
  .handler(async ({ data, context }) => {
    await requireActive(context);
    const { data: club, error } = await context.supabase.from("clubs").update({
      short_name: data.shortName, abbreviation: data.abbreviation, description: data.description || null,
      responsible_name: data.responsibleName, contact_info: data.contactInfo, crest_url: data.crestUrl,
    }).eq("id", data.id).eq("manager_id", context.userId).select().single();
    if (error || !club) throw new Error("Você não tem permissão para editar esta equipe.");
    await audit(context.userId, "club.profile_updated_by_manager", "club", club.id, { name: club.name });
    return { ok: true };
  });

const playerInput = z.object({
  sportName: z.string().trim().min(2).max(100), platformId: z.string().trim().max(100).optional(),
  position: z.string().trim().max(20).optional(), marketValue: z.number().min(0).max(1_000_000_000).default(0),
});

export const managerAddPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ clubId: z.string().uuid(), ...playerInput.shape }))
  .handler(async ({ data, context }) => {
    await requireActive(context);
    const { data: club } = await context.supabase.from("clubs").select("id").eq("id", data.clubId).eq("manager_id", context.userId).maybeSingle();
    if (!club) throw new Error("Você não tem permissão para gerenciar este elenco.");
    const { data: player, error } = await context.supabase.from("players").insert({ club_id: data.clubId, sport_name: data.sportName, platform_id: data.platformId || null, position: data.position || null, market_value: data.marketValue }).select().single();
    if (error || !player) throw new Error("Não foi possível cadastrar o jogador.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("player_club_history").insert({ player_id: player.id, club_id: data.clubId });
    await audit(context.userId, "player.added_to_roster", "player", player.id, { club_id: data.clubId, sport_name: player.sport_name });
    return { id: player.id };
  });

export const managerUpdatePlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), clubId: z.string().uuid(), ...playerInput.shape }))
  .handler(async ({ data, context }) => {
    await requireActive(context);
    const { data: player, error } = await context.supabase.from("players").update({ sport_name: data.sportName, platform_id: data.platformId || null, position: data.position || null, market_value: data.marketValue }).eq("id", data.id).eq("club_id", data.clubId).select().single();
    if (error || !player) throw new Error("Jogador não encontrado no seu elenco ou alteração não permitida.");
    await audit(context.userId, "player.roster_updated", "player", player.id, { club_id: data.clubId, sport_name: player.sport_name });
    return { ok: true };
  });

export const managerDeletePlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), clubId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireActive(context);
    const { data: player, error } = await context.supabase.from("players").delete().eq("id", data.id).eq("club_id", data.clubId).select("id, sport_name").single();
    if (error || !player) throw new Error("Jogador não encontrado no seu elenco ou remoção não permitida.");
    await audit(context.userId, "player.removed_from_roster", "player", player.id, { club_id: data.clubId, sport_name: player.sport_name });
    return { ok: true };
  });

export const listAdminAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperadmin(context);
    const [{ data: profiles, error }, { data: roleRows }, { data: clubs }] = await Promise.all([
      context.supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      context.supabase.from("user_roles").select("user_id, role"),
      context.supabase.from("clubs").select("id, name, manager_id"),
    ]);
    if (error) throw new Error("Não foi possível carregar as contas.");
    return (profiles ?? []).map((profile) => ({
      id: profile.id, display_name: profile.display_name, afcb_id: profile.afcb_id, account_status: profile.account_status,
      contact_info: profile.contact_info, created_at: profile.created_at,
      roles: (roleRows ?? []).filter((row) => row.user_id === profile.id).map((row) => row.role),
      club_id: clubs?.find((club) => club.manager_id === profile.id)?.id ?? null,
      club_name: clubs?.find((club) => club.manager_id === profile.id)?.name ?? null,
    }));
  });

export const adminCreateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(accountInput)
  .handler(async ({ data, context }) => {
    await requireSuperadmin(context);
    const user = await createAuthAccount({ afcbId: data.afcbId, password: data.password, displayName: data.displayName, role: data.role, contactInfo: data.contactInfo });
    if (data.clubId && data.role === "club_manager") {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("clubs").update({ manager_id: user.id }).eq("id", data.clubId).is("manager_id", null);
      if (error) {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        throw new Error("Não foi possível vincular o gestor à equipe.");
      }
    }
    await audit(context.userId, "account.created_by_admin", "profile", user.id, { afcb_id: data.afcbId, role: data.role, club_id: data.clubId ?? null });
    return { id: user.id };
  });

export const adminSetAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid(), status: z.enum(["active", "suspended"]) }))
  .handler(async ({ data, context }) => {
    await requireSuperadmin(context);
    if (data.userId === context.userId && data.status === "suspended") throw new Error("Você não pode suspender a própria conta.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("profiles").update({ account_status: data.status }).eq("id", data.userId);
    if (error) throw new Error("Não foi possível alterar o acesso.");
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: data.status === "suspended" ? "876000h" : "none" });
    if (authError) {
      await supabaseAdmin.from("profiles").update({ account_status: data.status === "active" ? "suspended" : "active" }).eq("id", data.userId);
      throw new Error("Não foi possível concluir a alteração de acesso.");
    }
    await audit(context.userId, data.status === "active" ? "account.reactivated" : "account.suspended", "profile", data.userId, { status: data.status });
    return { ok: true };
  });

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid(), newPassword: password, requestId: z.string().uuid().optional() }))
  .handler(async ({ data, context }) => {
    await requireSuperadmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.newPassword });
    if (error) throw new Error("Não foi possível redefinir a senha. Verifique os requisitos de segurança.");
    if (data.requestId) await supabaseAdmin.from("access_reset_requests").update({ status: "completed", handled_at: new Date().toISOString(), handled_by: context.userId }).eq("id", data.requestId);
    await audit(context.userId, "account.password_reset_by_admin", "profile", data.userId, { request_id: data.requestId ?? null });
    return { ok: true };
  });

export const listAdminOversight = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperadmin(context);
    const [{ data: logs, error }, { data: requests }] = await Promise.all([
      context.supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100),
      context.supabase.from("access_reset_requests").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (error) throw new Error("Não foi possível carregar o histórico.");
    return { logs: logs ?? [], requests: requests ?? [] };
  });

export const adminRejectResetRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ requestId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await requireSuperadmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("access_reset_requests").update({ status: "rejected", handled_at: new Date().toISOString(), handled_by: context.userId }).eq("id", data.requestId);
    if (error) throw new Error("Não foi possível atualizar a solicitação.");
    await audit(context.userId, "account.reset_request_rejected", "access_reset_request", data.requestId);
    return { ok: true };
  });

export const getPlayerAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireActive(context);
    const [{ data: profile }, { data: player }] = await Promise.all([
      context.supabase.from("profiles").select("id, display_name, afcb_id, platform_id, avatar_url, created_at").eq("id", context.userId).single(),
      context.supabase.from("players").select("*").eq("user_id", context.userId).maybeSingle(),
    ]);
    return { profile, player };
  });

export const adminDeleteClub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), confirmName: z.string().trim().min(1), reason: z.string().trim().min(5, "Informe o motivo da exclusão.").max(500) }))
  .handler(async ({ data, context }) => {
    await requireSuperadmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: club } = await supabaseAdmin.from("clubs").select("id, name, manager_id, deleted_at").eq("id", data.id).maybeSingle();
    if (!club || club.deleted_at) throw new Error("Equipe não encontrada.");
    if (club.name.trim() !== data.confirmName) throw new Error("O nome digitado não confere com o nome da equipe.");
    // Exclusão lógica: preserva elenco, transferências e histórico de competições.
    const { error } = await supabaseAdmin.from("clubs").update({ status: "suspended", deleted_at: new Date().toISOString(), deleted_by: context.userId, review_notes: `Excluída: ${data.reason}` }).eq("id", club.id);
    if (error) throw new Error("Não foi possível excluir a equipe.");
    if (club.manager_id) await supabaseAdmin.from("profiles").update({ account_status: "suspended" }).eq("id", club.manager_id);
    await audit(context.userId, "club.deleted", "club", club.id, { name: club.name, reason: data.reason });
    return { ok: true };
  });
