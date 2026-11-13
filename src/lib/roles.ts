export type AppRole = "superadmin" | "club_manager" | "player";

export const roleLabel: Record<AppRole, string> = {
  superadmin: "Superadministrador",
  club_manager: "Gestor do Clube",
  player: "Jogador",
};

export function homeForRoles(roles: AppRole[]) {
  if (roles.includes("superadmin")) return "/admin" as const;
  if (roles.includes("club_manager")) return "/clube" as const;
  if (roles.includes("player")) return "/jogador" as const;
  return "/painel" as const;
}

export const canViewPanel = (roles: AppRole[], role: AppRole) => roles.includes("superadmin") || roles.includes(role);