import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../utils/apiError';
import { getRange } from '../utils/pagination';
import { assertOwner } from './project.model';

// Public fields only. No contact details here.
const INVITATION_SELECT = `
  id, project_id, inviter_id, invitee_id, message, status, created_at, updated_at,
  invitee:profiles!invitee_id (
    id, name, college, major, user_skills ( skills ( id, name, category ) )
  ),
  inviter:profiles!inviter_id ( id, name ),
  project:projects!project_id ( id, title, domain, stage, status )
`;

const toInvitation = (row: any) => ({
  id: row.id,
  projectId: row.project_id,
  inviterId: row.inviter_id,
  inviteeId: row.invitee_id,
  message: row.message,
  status: row.status,
  invitee: row.invitee
    ? {
        id: row.invitee.id,
        name: row.invitee.name,
        college: row.invitee.college,
        major: row.invitee.major,
        skills: (row.invitee.user_skills ?? []).map((us: any) => us.skills),
      }
    : null,
  inviter: row.inviter ?? null,
  project: row.project ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getInvitation = async (db: SupabaseClient, invitationId: string) => {
  const { data, error } = await db
    .from('invitations')
    .select(INVITATION_SELECT)
    .eq('id', invitationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound('Invitation not found');

  return toInvitation(data);
};

export const sendInvitation = async (
  db: SupabaseClient,
  projectId: string,
  inviterId: string,
  input: { inviteeId: string; message?: string }
) => {
  if (input.inviteeId === inviterId) {
    throw ApiError.badRequest('You cannot invite yourself');
  }

  await assertOwner(db, projectId, inviterId); // 404 / 403 as in Step 15b

  const { data: project, error } = await db
    .from('projects')
    .select('status, max_team_size')
    .eq('id', projectId)
    .single();
  if (error) throw error;

  if (project.status !== 'Looking for Members') {
    throw ApiError.conflict('Recruitment is not open for this project');
  }

  const { count, error: countError } = await db
    .from('project_members')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);
  if (countError) throw countError;

  if ((count ?? 0) >= project.max_team_size) {
    throw ApiError.conflict('The team is full');
  }

  const { data: invitee, error: inviteeError } = await db
    .from('profiles')
    .select('id')
    .eq('id', input.inviteeId)
    .maybeSingle();
  if (inviteeError) throw inviteeError;
  if (!invitee) throw ApiError.notFound('User not found');

  const row: Record<string, unknown> = {
    project_id: projectId,
    inviter_id: inviterId,
    invitee_id: input.inviteeId,
  };
  if (input.message !== undefined) row.message = input.message;

  const { data, error: insertError } = await db
    .from('invitations')
    .insert(row)
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      throw ApiError.conflict('This person already has a pending invitation to this project');
    }
    throw insertError; // "already a member" from the trigger is mapped by the error handler
  }

  return getInvitation(db, data.id);
};

export const listProjectInvitations = async (
  db: SupabaseClient,
  projectId: string,
  userId: string,
  f: { status?: string; page: number; limit: number }
) => {
  await assertOwner(db, projectId, userId);

  const buildQuery = () => {
    let query = db
      .from('invitations')
      .select(INVITATION_SELECT, { count: 'exact' })
      .eq('project_id', projectId);

    if (f.status) query = query.eq('status', f.status);

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

  return { data: (data ?? []).map(toInvitation), total: count ?? 0 };
};
export const respondToInvitation = async (
  db: SupabaseClient,
  invitationId: string,
  userId: string,
  newStatus: 'accepted' | 'declined' | 'cancelled'
) => {
  const { data: inv, error } = await db
    .from('invitations')
    .select('id, inviter_id, invitee_id, status')
    .eq('id', invitationId)
    .maybeSingle();

  if (error) throw error;
  if (!inv) throw ApiError.notFound('Invitation not found');

  // Who is allowed to do what
  if (newStatus === 'cancelled') {
    if (inv.inviter_id !== userId) throw ApiError.forbidden('Only the inviter can cancel');
  } else if (inv.invitee_id !== userId) {
    throw ApiError.forbidden('Only the invited user can accept or decline');
  }

  if (inv.status !== 'pending') {
    throw ApiError.conflict('This invitation has already been decided');
  }

  // Only a still-pending row changes, so two quick requests can't both win
  const { data: updated, error: updateError } = await db
    .from('invitations')
    .update({ status: newStatus })
    .eq('id', invitationId)
    .eq('status', 'pending')
    .select('id');

  if (updateError) throw updateError; // "Team is full" comes from here
  if (!updated || updated.length === 0) {
    throw ApiError.conflict('This invitation has already been decided');
  }

  return getInvitation(db, invitationId);
};

// The candidate's own list: project and inviter summary
const MY_INVITATION_SELECT = `
  id, project_id, message, status, created_at, updated_at,
  inviter:profiles!inviter_id ( id, name ),
  project:projects!project_id ( id, title, domain, stage, status )
`;

const toMyInvitation = (row: any) => ({
  id: row.id,
  projectId: row.project_id,
  message: row.message,
  status: row.status,
  inviter: row.inviter ?? null,
  project: row.project ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listMyInvitations = async (
  db: SupabaseClient,
  userId: string,
  f: { status?: string; page: number; limit: number }
) => {
  const buildQuery = () => {
    let query = db
      .from('invitations')
      .select(MY_INVITATION_SELECT, { count: 'exact' })
      .eq('invitee_id', userId); // only the ones I received

    if (f.status) query = query.eq('status', f.status);

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

  return { data: (data ?? []).map(toMyInvitation), total: count ?? 0 };
};