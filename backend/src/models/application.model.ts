import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../utils/apiError';


const APPLICATION_SELECT = `
  id, project_id, applicant_id, message, status, created_at, updated_at,
  applicant:profiles!applicant_id (
    id, name, college, major, user_skills ( skills ( id, name, category ) )
  ),
  project:projects!project_id ( id, title, stage, status )
`;

const toApplication = (row: any) => ({
  id: row.id,
  projectId: row.project_id,
  applicantId: row.applicant_id,
  message: row.message,
  status: row.status,
  applicant: row.applicant
    ? {
        id: row.applicant.id,
        name: row.applicant.name,
        college: row.applicant.college,
        major: row.applicant.major,
        skills: (row.applicant.user_skills ?? []).map((us: any) => us.skills),
      }
    : null,
  project: row.project ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getApplication = async (db: SupabaseClient, applicationId: string) => {
  const { data, error } = await db
    .from('applications')
    .select(APPLICATION_SELECT)
    .eq('id', applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound('Application not found');

  return toApplication(data);
};

export const submitApplication = async (
  db: SupabaseClient,
  projectId: string,
  applicantId: string,
  message?: string
) => {
  
  const { data: project, error: projectError } = await db
    .from('projects')
    .select('owner_id, status')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) throw ApiError.notFound('Project not found');
  if (project.owner_id === applicantId) {
    throw ApiError.forbidden('You cannot apply to your own project');
  }
  if (project.status !== 'Looking for Members') {
    throw ApiError.conflict('This project is not accepting applications');
  }

  const row: Record<string, unknown> = { project_id: projectId, applicant_id: applicantId };
  if (message !== undefined) row.message = message;

  const { data, error } = await db.from('applications').insert(row).select('id').single();

  if (error) {
    // 23505 = unique violation: the "one pending application" index
    if (error.code === '23505') {
      throw ApiError.conflict('You already have a pending application for this project');
    }
    throw error; // "already a member" from the trigger is mapped by the error handler
  }

  return getApplication(db, data.id);
};
import { assertOwner } from './project.model';
import { getRange } from '../utils/pagination';

export const listProjectApplications = async (
  db: SupabaseClient,
  projectId: string,
  userId: string,
  f: { status?: string; page: number; limit: number }
) => {
  await assertOwner(db, projectId, userId); // 404 / 403 as in Step 15b

  const buildQuery = () => {
    let query = db
      .from('applications')
      .select(APPLICATION_SELECT, { count: 'exact' })
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

  return { data: (data ?? []).map(toApplication), total: count ?? 0 };
};

export const decideApplication = async (
  db: SupabaseClient,
  applicationId: string,
  userId: string,
  newStatus: 'accepted' | 'rejected' | 'withdrawn'
) => {
  const { data: app, error } = await db
    .from('applications')
    .select('id, applicant_id, status, project:projects!project_id ( owner_id )')
    .eq('id', applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!app) throw ApiError.notFound('Application not found');

  // Who is allowed to do what
  if (newStatus === 'withdrawn') {
    if (app.applicant_id !== userId) {
      throw ApiError.forbidden('Only the applicant can withdraw');
    }
  } else {
    const project: any = Array.isArray(app.project) ? app.project[0] : app.project;
    if (project?.owner_id !== userId) {
      throw ApiError.forbidden('Only the project lead can accept or reject');
    }
  }

  if (app.status !== 'pending') {
    throw ApiError.conflict('This application has already been decided');
  }

  // Only a still-pending row is changed, so two quick requests can't both win
  const { data: updated, error: updateError } = await db
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId)
    .eq('status', 'pending')
    .select('id');

  if (updateError) throw updateError; // "Team is full" comes from here
  if (!updated || updated.length === 0) {
    throw ApiError.conflict('This application has already been decided');
  }

  return getApplication(db, applicationId);
};
// The applicant's own list: project summary, no applicant block (it's always you)
const MY_APPLICATION_SELECT = `
  id, project_id, message, status, created_at, updated_at,
  project:projects!project_id (
    id, title, domain, stage, status,
    owner:profiles!owner_id ( id, name )
  )
`;

const toMyApplication = (row: any) => ({
  id: row.id,
  projectId: row.project_id,
  message: row.message,
  status: row.status,
  project: row.project ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listMyApplications = async (
  db: SupabaseClient,
  userId: string,
  f: { status?: string; page: number; limit: number }
) => {
  const buildQuery = () => {
    let query = db
      .from('applications')
      .select(MY_APPLICATION_SELECT, { count: 'exact' })
      .eq('applicant_id', userId); // only the ones I sent

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

  return { data: (data ?? []).map(toMyApplication), total: count ?? 0 };
};