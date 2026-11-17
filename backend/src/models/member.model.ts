import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../utils/apiError';
import { getRange } from '../utils/pagination';

// Public fields only. No contact details here.
const MEMBER_SELECT = `
  user_id, role, joined_at,
  profile:profiles!user_id ( name, major )
`;

const toMember = (row: any) => ({
  userId: row.user_id,
  name: row.profile?.name ?? '',
  major: row.profile?.major ?? null,
  role: row.role,
  joinedAt: row.joined_at,
});

export const listMembers = async (
  db: SupabaseClient,
  projectId: string,
  f: { page: number; limit: number }
) => {
  // Show the roster only for projects this user is allowed to see
  const { data: project, error: projectError } = await db
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .maybeSingle();
  if (projectError) throw projectError;
  if (!project) throw ApiError.notFound('Project not found');

  const buildQuery = () =>
    db
      .from('project_members')
      .select(MEMBER_SELECT, { count: 'exact' })
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true })
      .order('user_id');

  const { from, to } = getRange(f.page, f.limit);
  const { data, error, count } = await buildQuery().range(from, to);

  if (error?.code === 'PGRST103') {
    const head = await buildQuery().range(0, 0);
    if (head.error) throw head.error;
    return { data: [], total: head.count ?? 0 };
  }
  if (error) throw error;

  return { data: (data ?? []).map(toMember), total: count ?? 0 };
};

export const removeMember = async (
  db: SupabaseClient,
  projectId: string,
  callerId: string,
  targetUserId: string
) => {
  const { data: project, error } = await db
    .from('projects')
    .select('owner_id')
    .eq('id', projectId)
    .maybeSingle();
  if (error) throw error;
  if (!project) throw ApiError.notFound('Project not found');

  // Only the lead, or the member themselves
  const callerIsLead = project.owner_id === callerId;
  if (!callerIsLead && callerId !== targetUserId) {
    throw ApiError.forbidden('Only the project lead or the member themselves can remove a member');
  }

  const { data: member, error: memberError } = await db
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', targetUserId)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!member) throw ApiError.notFound('Member not found');

  if (member.role === 'lead') {
    throw ApiError.conflict('The project lead cannot be removed. Delete the project instead.');
  }

  const { data: removed, error: deleteError } = await db
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', targetUserId)
    .select('id');
  if (deleteError) throw deleteError;
  if (!removed || removed.length === 0) throw ApiError.notFound('Member not found');
};