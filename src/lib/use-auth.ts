import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "superadmin" | "club_manager" | "player";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async (u: User | null) => {
      setUser(u);
      if (u) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
        setRoles((data ?? []).map((r) => r.role as AppRole));
      } else setRoles([]);
      setLoading(false);
    };
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => load(s?.user ?? null), 0); });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, roles, loading, has: (r: AppRole) => roles.includes(r) };
}

export const roleLabel: Record<AppRole, string> = {
  superadmin: "Superadministrador",
  club_manager: "Gestor do Clube",
  player: "Jogador",
};

export function homeForRoles(roles: AppRole[]) {
  if (roles.includes("superadmin")) return "/admin" as const;
  if (roles.includes("club_manager")) return "/clube" as const;
  return "/jogador" as const;
}
