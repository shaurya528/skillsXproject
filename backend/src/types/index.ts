export const STAGES = ['Idea', 'Ongoing', 'Final Phase'] as const;
export type Stage = (typeof STAGES)[number];

export const PROJECT_STATUSES = [
  'Looking for Members',
  'Closed',
  'Team Formed',
  'In Progress',
  'Completed',
  'Archived',
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected', 'withdrawn'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export const INVITATION_STATUSES = ['pending', 'accepted', 'declined', 'cancelled'] as const;
export type InvitationStatus = (typeof INVITATION_STATUSES)[number];
export const NOTIFICATION_TYPES = [
  'application_received',
  'application_accepted',
  'application_rejected',
  'application_withdrawn',
  'invitation_received',
  'invitation_accepted',
  'invitation_declined',
  'invitation_cancelled',
  'member_removed',
  'member_left',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];