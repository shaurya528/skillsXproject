import { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '../utils/apiError';
import { getRange } from '../utils/pagination';

const COLUMNS = 'id, type, message, related_project_id, is_read, created_at';

const toNotification = (row: any) => ({
  id: row.id,
  type: row.type,
  message: row.message,
  relatedProjectId: row.related_project_id,
  isRead: row.is_read,
  createdAt: row.created_at,
});

export const listNotifications = async (
  db: SupabaseClient,
  userId: string,
  f: { isRead?: boolean; type?: string; page: number; limit: number }
) => {
  const buildQuery = () => {
    let query = db
      .from('notifications')
      .select(COLUMNS, { count: 'exact' })
      .eq('recipient_id', userId);

    if (f.isRead !== undefined) query = query.eq('is_read', f.isRead);
    if (f.type) query = query.eq('type', f.type);

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

  return { data: (data ?? []).map(toNotification), total: count ?? 0 };
};

export const getUnreadCount = async (db: SupabaseClient, userId: string) => {
  const { count, error } = await db
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
};

export const markNotification = async (
  db: SupabaseClient,
  userId: string,
  notificationId: string,
  isRead: boolean
) => {
  const { data, error } = await db
    .from('notifications')
    .update({ is_read: isRead })
    .eq('id', notificationId)
    .eq('recipient_id', userId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw ApiError.notFound('Notification not found');

  return toNotification(data);
};

export const markManyNotifications = async (
  db: SupabaseClient,
  userId: string,
  input: { ids?: string[]; all?: true; isRead: boolean }
) => {
  let query = db
    .from('notifications')
    .update({ is_read: input.isRead })
    .eq('recipient_id', userId)
    .neq('is_read', input.isRead); // only rows that actually change

  if (input.ids) query = query.in('id', input.ids);

  const { data, error } = await query.select('id');
  if (error) throw error;

  return (data ?? []).length;
};