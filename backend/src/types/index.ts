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

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';