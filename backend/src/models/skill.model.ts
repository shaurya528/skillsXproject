import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../utils/apiError';

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


// Throws a 400 if any of the ids is not in the fixed skills list
export const assertSkillsExist = async (db: SupabaseClient, ids: string[]) => {
  if (ids.length === 0) return;

  const { data, error } = await db.from('skills').select('id').in('id', ids);
  if (error) throw error;

  if ((data ?? []).length !== ids.length) {
    throw ApiError.badRequest('One or more skills do not exist');
  }
};