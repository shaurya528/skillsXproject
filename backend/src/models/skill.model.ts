import { SupabaseClient } from '@supabase/supabase-js';

export const listSkills = async (
  db: SupabaseClient,
  filters: { category?: string; q?: string }
) => {
  let query = db
    .from('skills')
    .select('id, name, category')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.q) {
    // % and _ are wildcard characters in LIKE, so treat them as plain text
    const safe = filters.q.replace(/[%_\\]/g, '\\$&');
    query = query.ilike('name', `%${safe}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};