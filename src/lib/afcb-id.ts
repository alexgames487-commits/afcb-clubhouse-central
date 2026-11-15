import type { Tables } from "@/integrations/supabase/types";
import type { AppRole } from "./roles";

export const AFCB_DOMAIN = "@afcb.com";
export const AFCB_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}@afcb\.com$/;

export function normalizeAfcbId(value: string) {
  const normalized = value.trim().toLocaleLowerCase("pt-BR");
  if (!normalized.includes("@")) return `${normalized}${AFCB_DOMAIN}`;
  return normalized;
}

export function isValidAfcbId(value: string) {
  return AFCB_ID_PATTERN.test(normalizeAfcbId(value));
}

export function afcbIdError(value: string) {
  if (!value.trim()) return "Informe seu identificador AFCB.";
  return isValidAfcbId(value) ? null : "Use de 3 a 32 caracteres: letras minúsculas, números, ponto, hífen ou sublinhado, sem espaços.";
}

export function slugify(value: string) {
  const slug = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
  return slug || "equipe";
}

export const clubStatusLabels: Record<string, string> = {
  pending: "Pendente de aprovação",
  approved: "Aprovado",
  rejected: "Rejeitado",
  suspended: "Suspenso",
};

export type ClubDTO = Tables<"clubs"> & {
  crest_display_url: string | null;
  manager_afcb_id?: string | null;
  player_count?: number;
};
export type PlayerDTO = Tables<"players">;
export type AccountDTO = {
  id: string;
  display_name: string | null;
  afcb_id: string | null;
  account_status: string;
  contact_info: string | null;
  created_at: string;
  roles: AppRole[];
  club_id: string | null;
  club_name: string | null;
};
export type ManagerClubDTO = { club: ClubDTO | null; players: PlayerDTO[] };
export type AuditDTO = Tables<"audit_log">;
export type ResetRequestDTO = Tables<"access_reset_requests">;
