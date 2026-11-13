import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./roles";
export { roleLabel, homeForRoles, type AppRole } from "./roles";

export function useAuth() {
  const query = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return { user: null, roles: [] as AppRole[] };
      const result = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      if (result.error) throw result.error;
      return { user: data.user, roles: (result.data ?? []).map((r) => r.role) };
    },
    staleTime: 60_000,
    retry: false,
  });
  const roles = query.data?.roles ?? [];
  return { user: query.data?.user ?? null, roles, loading: query.isPending, error: query.error, has: (r: AppRole) => roles.includes(r) };
}
