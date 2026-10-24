import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase';
import { ApiError } from '../utils/apiError';

const PROFILE_COLUMNS =
  'id, name, college, major, interested_in, github, linkedin, created_at, updated_at';

const FIELD_MAP = {
  name: 'name',
  college: 'college',
  major: 'major',
  interestedIn: 'interested_in',
  github: 'github',
  linkedin: 'linkedin',
} as const;

const toProfile = (row: any) => ({
  id: row.id,
  name: row.name,
  college: row.college,
  major: row.major,
  interestedIn: row.interested_in,
  github: row.github,
  linkedin: row.linkedin,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Profile + skills + private contact, in one query
export const findMe = async (db: SupabaseClient, userId: string) => {
  const { data, error } = await db
    .from('profiles')
    .select(
      `${PROFILE_COLUMNS},
       user_skills ( skills ( id, name, category ) ),
       user_contacts ( contact_email, discord, phone )`
    )
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound('Profile not found');

  const contactRow = Array.isArray(data.user_contacts)
    ? data.user_contacts[0]
    : data.user_contacts;

  return {
    profile: toProfile(data),
    skills: (data.user_skills ?? []).map((us: any) => us.skills),
    contact: {
      contactEmail: contactRow?.contact_email ?? null,
      discord: contactRow?.discord ?? null,
      phone: contactRow?.phone ?? null,
    },
  };
};

export const updateProfile = async (
  db: SupabaseClient,
  userId: string,
  input: Record<string, unknown>
) => {
  const changes: Record<string, unknown> = {};
  for (const [apiKey, dbKey] of Object.entries(FIELD_MAP)) {
    if (input[apiKey] !== undefined) changes[dbKey] = input[apiKey];
  }

  const { data, error } = await db
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound('Profile not found');
  return toProfile(data);
};

// Deleting the auth user cascades to profiles, contacts, skills, etc.
export const deleteAccount = async (userId: string) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw ApiError.badRequest(error.message);
};

// All skills of one user, as { id, name, category }[]
const getUserSkills = async (db: SupabaseClient, userId: string) => {
    const { data, error } = await db
      .from('user_skills')
      .select('skills ( id, name, category )')
      .eq('user_id', userId);
  
    if (error) throw error;
    return (data ?? []).map((row: any) => row.skills);
  };
  
  export const replaceSkills = async (
    db: SupabaseClient,
    userId: string,
    skillIds: string[]
  ) => {
    const ids = [...new Set(skillIds)]; 
  
   
    if (ids.length > 0) {
      const { data: found, error } = await db.from('skills').select('id').in('id', ids);
      if (error) throw error;
      if ((found ?? []).length !== ids.length) {
        throw ApiError.badRequest('One or more skills do not exist');
      }
  
     
      const rows = ids.map((skill_id) => ({ user_id: userId, skill_id }));
      const { error: insertError } = await db
        .from('user_skills')
        .upsert(rows, { onConflict: 'user_id,skill_id', ignoreDuplicates: true });
      if (insertError) throw insertError;
    }
  
   
    let removal = db.from('user_skills').delete().eq('user_id', userId);
    if (ids.length > 0) {
      removal = removal.not('skill_id', 'in', `(${ids.join(',')})`);
    }
    const { error: deleteError } = await removal;
    if (deleteError) throw deleteError;
  
    return getUserSkills(db, userId);
  };