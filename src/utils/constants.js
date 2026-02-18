// API Configuration
export const API_URL = import.meta.env.VITE_NEXTCODE_API_URL || 'https://uat-app.valerionhealth.com/integrations/ai';
export const MEDX_API_URL = import.meta.env.VITE_MEDX_API_URL || 'http://103.142.175.170:4500/api';
export const MEDX_WS_URL = import.meta.env.VITE_MEDX_WS_URL || 'ws://103.142.175.170:4500/api/ws';

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
