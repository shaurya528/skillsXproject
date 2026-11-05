import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../utils/apiError';
import { assertSkillsExist } from './skill.model';
import { getRange } from '../utils/pagination';


// One query returns the project, its owner summary, required skills and member count.
// Private contact data is never selected here.
const PROJECT_SELECT = `
  id, owner_id, title, description, domain, stage, status,
  max_team_size, github_url, created_at, updated_at,
  owner:profiles!owner_id ( id, name, college, major ),
  project_required_skills ( skills ( id, name, category ) ),
  project_members ( count )
`;

// snake_case (database) -> camelCase (API)
const toProject = (row: any) => {
  const memberCount = row.project_members?.[0]?.count ?? 0;
  return {
    id: row.id,
    ownerId: row.owner_id,
    owner: row.owner,
    title: row.title,
    description: row.description,
    domain: row.domain,
    stage: row.stage,
    status: row.status,
    maxTeamSize: row.max_team_size,
    githubUrl: row.github_url,
    requiredSkills: (row.project_required_skills ?? []).map((r: any) => r.skills),
    memberCount,
    openSlots: Math.max(0, row.max_team_size - memberCount),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const getProject = async (db: SupabaseClient, projectId: string) => {
  const { data, error } = await db
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('id', projectId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound('Project not found');

  return toProject(data);
};

export const createProject = async (
  db: SupabaseClient,
  ownerId: string,
  input: {
    title: string;
    description?: string;
    domain?: string;
    stage?: string;
    maxTeamSize?: number;
    githubUrl?: string;
    requiredSkillIds?: string[];
  }
) => {
  // 1) Check the skills BEFORE creating anything
  const skillIds = [...new Set(input.requiredSkillIds ?? [])];
  await assertSkillsExist(db, skillIds);

  // 2) Create the project (only fields the user sent; the database fills the defaults)
  const row: Record<string, unknown> = { owner_id: ownerId, title: input.title };
  if (input.description !== undefined) row.description = input.description;
  if (input.domain !== undefined) row.domain = input.domain;
  if (input.stage !== undefined) row.stage = input.stage;
  if (input.maxTeamSize !== undefined) row.max_team_size = input.maxTeamSize;
  if (input.githubUrl !== undefined) row.github_url = input.githubUrl;

  const { data: created, error } = await db
    .from('projects')
    .insert(row)
    .select('id')
    .single();
  if (error) throw error;

  // 3) Attach the required skills; if that fails, remove the half-made project
  if (skillIds.length > 0) {
    const { error: skillsError } = await db
      .from('project_required_skills')
      .insert(skillIds.map((skill_id) => ({ project_id: created.id, skill_id })));

    if (skillsError) {
      await db.from('projects').delete().eq('id', created.id);
      throw skillsError;
    }
  }

  return getProject(db, created.id);
};
// 404 if the user can't see the project, 403 if they can see it but are not the lead
export const assertOwner = async (db: SupabaseClient, projectId: string, userId: string) => {
    const { data, error } = await db
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .maybeSingle();
  
    if (error) throw error;
    if (!data) throw ApiError.notFound('Project not found');
    if (data.owner_id !== userId) throw ApiError.forbidden('Only the project lead can do this');
  };
  // camelCase (API) -> snake_case (database)
const UPDATE_FIELDS = {
    title: 'title',
    description: 'description',
    domain: 'domain',
    stage: 'stage',
    maxTeamSize: 'max_team_size',
    githubUrl: 'github_url',
  } as const;
  
  export const updateProject = async (
    db: SupabaseClient,
    projectId: string,
    userId: string,
    input: Record<string, unknown>
  ) => {
    await assertOwner(db, projectId, userId);
  
    // The new size can't be smaller than the people already on the team
    if (input.maxTeamSize !== undefined) {
      const { count, error } = await db
        .from('project_members')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (error) throw error;
  
      if ((input.maxTeamSize as number) < (count ?? 0)) {
        throw ApiError.conflict(
          `The team already has ${count} members, so maxTeamSize cannot be lower than that`
        );
      }
    }
  
    const changes: Record<string, unknown> = {};
    for (const [apiKey, dbKey] of Object.entries(UPDATE_FIELDS)) {
      if (input[apiKey] !== undefined) changes[dbKey] = input[apiKey];
    }
  
    const { error } = await db.from('projects').update(changes).eq('id', projectId);
    if (error) throw error;
  
    return getProject(db, projectId);
  };
  
  export const replaceRequiredSkills = async (
    db: SupabaseClient,
    projectId: string,
    userId: string,
    skillIds: string[]
  ) => {
    await assertOwner(db, projectId, userId);
  
    const ids = [...new Set(skillIds)];
    await assertSkillsExist(db, ids);
  
    // Add the missing ones first, remove the rest last (the safe order, as in Step 13b)
    if (ids.length > 0) {
      const rows = ids.map((skill_id) => ({ project_id: projectId, skill_id }));
      const { error } = await db
        .from('project_required_skills')
        .upsert(rows, { onConflict: 'project_id,skill_id', ignoreDuplicates: true });
      if (error) throw error;
    }
  
    let removal = db.from('project_required_skills').delete().eq('project_id', projectId);
    if (ids.length > 0) {
      removal = removal.not('skill_id', 'in', `(${ids.join(',')})`);
    }
    const { error: deleteError } = await removal;
    if (deleteError) throw deleteError;
  
    const project = await getProject(db, projectId);
    return project.requiredSkills;
  };
  
  export const deleteProject = async (db: SupabaseClient, projectId: string, userId: string) => {
    await assertOwner(db, projectId, userId);
  
    const { data, error } = await db.from('projects').delete().eq('id', projectId).select('id');
    if (error) throw error;
    if (!data || data.length === 0) throw ApiError.notFound('Project not found');
  };
  import { ProjectStatus } from '../types';

// Which moves the lead may make (from your spec)
const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  'Looking for Members': ['Closed'],
  'Closed': ['Looking for Members', 'Team Formed'],
  'Team Formed': ['In Progress'],
  'In Progress': ['Completed'],
  'Completed': ['Archived'],
  'Archived': [],
};

// Moving to any of these ends recruitment for good
const ENDS_RECRUITMENT: ProjectStatus[] = [
  'Team Formed', 'In Progress', 'Completed', 'Archived',
];

// Reject pending applications and cancel pending invitations.
// The database triggers send the notifications.
const clearPendingItems = async (db: SupabaseClient, projectId: string) => {
  const { error: appError } = await db
    .from('applications')
    .update({ status: 'rejected' })
    .eq('project_id', projectId)
    .eq('status', 'pending');

  const { error: invError } = await db
    .from('invitations')
    .update({ status: 'cancelled' })
    .eq('project_id', projectId)
    .eq('status', 'pending');

  if (appError) console.error('Could not clear pending applications:', appError.message);
  if (invError) console.error('Could not clear pending invitations:', invError.message);
};

export const changeProjectStatus = async (
  db: SupabaseClient,
  projectId: string,
  userId: string,
  newStatus: ProjectStatus
) => {
  await assertOwner(db, projectId, userId);

  const { data: project, error } = await db
    .from('projects')
    .select('status, max_team_size')
    .eq('id', projectId)
    .single();
  if (error) throw error;

  const current = project.status as ProjectStatus;

  if (current === newStatus) {
    throw ApiError.conflict(`The project is already "${newStatus}"`);
  }
  if (!ALLOWED_TRANSITIONS[current].includes(newStatus)) {
    throw ApiError.conflict(`Cannot change status from "${current}" to "${newStatus}"`);
  }

  // Reopening recruitment only makes sense if there is a free slot
  if (current === 'Closed' && newStatus === 'Looking for Members') {
    const { count, error: countError } = await db
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    if (countError) throw countError;

    if ((count ?? 0) >= project.max_team_size) {
      throw ApiError.conflict('The team is full, so recruitment cannot be reopened');
    }
  }

  const { error: updateError } = await db
    .from('projects')
    .update({ status: newStatus })
    .eq('id', projectId);
  if (updateError) throw updateError;

  if (ENDS_RECRUITMENT.includes(newStatus)) {
    await clearPendingItems(db, projectId);
  }

  return getProject(db, projectId);
};


const escapeLike = (s: string) => s.replace(/[%_\\]/g, '\\$&');

// Which projects require the requested skills?
const findProjectIdsBySkills = async (
  db: SupabaseClient,
  skillIds: string[],
  match: 'any' | 'all'
) => {
  const wanted = [...new Set(skillIds)];

  const { data, error } = await db
    .from('project_required_skills')
    .select('project_id, skill_id')
    .in('skill_id', wanted);
  if (error) throw error;

  // project -> set of wanted skills it requires
  const perProject = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    if (!perProject.has(row.project_id)) perProject.set(row.project_id, new Set());
    perProject.get(row.project_id)!.add(row.skill_id);
  }

  return [...perProject.entries()]
    .filter(([, required]) => match === 'any' || required.size === wanted.length)
    .map(([projectId]) => projectId);
};

export const searchProjects = async (
  db: SupabaseClient,
  f: {
    skillIds?: string[];
    skillMatch: 'any' | 'all';
    domain?: string;
    stage?: string;
    q?: string;
    sort: 'newest' | 'oldest';
    page: number;
    limit: number;
  }
) => {
  // Step 1: narrow by skills first (if asked)
  let projectIds: string[] | undefined;
  if (f.skillIds && f.skillIds.length > 0) {
    projectIds = await findProjectIdsBySkills(db, f.skillIds, f.skillMatch);
    if (projectIds.length === 0) return { data: [], total: 0 };
  }

  // Step 2: main query. Only projects that are open for recruitment.
  const buildQuery = () => {
    let query = db
      .from('projects')
      .select(PROJECT_SELECT, { count: 'exact' })
      .eq('status', 'Looking for Members');

    if (projectIds) query = query.in('id', projectIds);
    if (f.domain) query = query.ilike('domain', `%${escapeLike(f.domain)}%`);
    if (f.stage) query = query.eq('stage', f.stage);
    if (f.q) query = query.ilike('title', `%${escapeLike(f.q)}%`);

    return query
      .order('created_at', { ascending: f.sort === 'oldest' })
      .order('id');
  };

  const { from, to } = getRange(f.page, f.limit);
  const { data, error, count } = await buildQuery().range(from, to);

  // A page beyond the last one is an empty list, not an error
  if (error?.code === 'PGRST103') {
    const head = await buildQuery().range(0, 0);
    if (head.error) throw head.error;
    return { data: [], total: head.count ?? 0 };
  }
  if (error) throw error;

  return { data: (data ?? []).map(toProject), total: count ?? 0 };
};