import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../config/supabase';
import { ApiError } from '../utils/apiError';
import { getRange } from '../utils/pagination';

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
  const toContact = (row: any) => ({
    contactEmail: row?.contact_email ?? null,
    discord: row?.discord ?? null,
    phone: row?.phone ?? null,
  });
  
  export const getContact = async (db: SupabaseClient, userId: string) => {
    const { data, error } = await db
      .from('user_contacts')
      .select('contact_email, discord, phone')
      .eq('user_id', userId)
      .maybeSingle();
  
    if (error) throw error;
    if (!data) throw ApiError.notFound('Contact details not found');
    return toContact(data);
  };
  
  export const updateContact = async (
    db: SupabaseClient,
    userId: string,
    input: { contactEmail?: string | null; discord?: string | null; phone?: string | null }
  ) => {
    const changes: Record<string, unknown> = {};
    if (input.contactEmail !== undefined) changes.contact_email = input.contactEmail;
    if (input.discord !== undefined) changes.discord = input.discord;
    if (input.phone !== undefined) changes.phone = input.phone;
  
    const { data, error } = await db
      .from('user_contacts')
      .update(changes)
      .eq('user_id', userId)
      .select('contact_email, discord, phone')
      .maybeSingle();
  
    if (error) throw error;
    if (!data) throw ApiError.notFound('Contact details not found');
    return toContact(data);
  };
  

// Only these columns are ever selected for other people.
// There is NO user_contacts here on purpose: contact details stay private.
const TALENT_SELECT = `
  id, name, college, major, interested_in, github, linkedin,
  user_skills ( skills ( id, name, category ) )
`;

const toTalent = (row: any) => ({
  id: row.id,
  name: row.name,
  college: row.college,
  major: row.major,
  skills: (row.user_skills ?? []).map((us: any) => us.skills),
  interestedIn: row.interested_in,
  github: row.github,
  linkedin: row.linkedin,
});

const escapeLike = (s: string) => s.replace(/[%_\\]/g, '\\$&');

// Which users have the requested skills?
const findUserIdsBySkills = async (
  db: SupabaseClient,
  skillIds: string[],
  match: 'any' | 'all'
) => {
  const wanted = [...new Set(skillIds)];

  const { data, error } = await db
    .from('user_skills')
    .select('user_id, skill_id')
    .in('skill_id', wanted);
  if (error) throw error;

  // user -> set of wanted skills they have
  const perUser = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    if (!perUser.has(row.user_id)) perUser.set(row.user_id, new Set());
    perUser.get(row.user_id)!.add(row.skill_id);
  }

  return [...perUser.entries()]
    .filter(([, owned]) => match === 'any' || owned.size === wanted.length)
    .map(([userId]) => userId);
};

export const searchTalent = async (
  db: SupabaseClient,
  f: {
    skillIds?: string[];
    skillMatch: 'any' | 'all';
    major?: string;
    college?: string;
    q?: string;
    page: number;
    limit: number;
  }
) => {
  
  let userIds: string[] | undefined;
  if (f.skillIds && f.skillIds.length > 0) {
    userIds = await findUserIdsBySkills(db, f.skillIds, f.skillMatch);
    if (userIds.length === 0) return { data: [], total: 0 };
  }

  
  const buildQuery = () => {
    let query = db.from('profiles').select(TALENT_SELECT, { count: 'exact' });

    if (userIds) query = query.in('id', userIds);
    if (f.major) query = query.ilike('major', `%${escapeLike(f.major)}%`);
    if (f.college) query = query.ilike('college', `%${escapeLike(f.college)}%`);
    if (f.q) query = query.ilike('name', `%${escapeLike(f.q)}%`);

    return query.order('created_at', { ascending: false }).order('id');
  };

  const { from, to } = getRange(f.page, f.limit);
  const { data, error, count } = await buildQuery().range(from, to);


  if (error?.code === 'PGRST103') {
    const head = await buildQuery().range(0, 0);
    if (head.error) throw head.error;
    return { data: [], total: head.count ?? 0 };
  }
  if (error) throw error;

  return { data: (data ?? []).map(toTalent), total: count ?? 0 };
};
export const getPublicProfile = async (db: SupabaseClient, userId: string) => {
  const { data, error } = await db
    .from('profiles')
    .select(TALENT_SELECT)
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound('User not found');

  return toTalent(data);
};