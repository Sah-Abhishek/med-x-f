// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://uat-app.valerionhealth.com/integrations/ai';

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  TEAM_LEAD: 'teamlead',
  CODER: 'coder',
  AUDITOR: 'auditor'
};

// Role Display Names
export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'System Administrator',
  [ROLES.TEAM_LEAD]: 'Team Lead',
  [ROLES.CODER]: 'Coder',
  [ROLES.AUDITOR]: 'Auditor'
};

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  TEAM_LEAD: '/teamlead',
  CODER: '/coder',
  AUDITOR: '/auditor',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404'
};
