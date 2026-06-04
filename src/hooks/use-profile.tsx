import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle();
      return data ?? { id: userData.user.id, display_name: "Gabi", subtitle: "Seu dashboard, sua inteligência", avatar_url: null };
    },
  });
}
