import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type UserRole = 'admin' | 'shelter' | 'adopter';

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data.role as UserRole;
};

export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map(r => r.role as UserRole);
};
