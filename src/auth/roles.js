// Role & permission definitions.
// A user may hold MULTIPLE roles; their effective permissions are the UNION
// of every role they hold. Customize ROLES / DEPARTMENTS per project.

export const ROLES = [
  'MasterAdmin',
  'CompanyManagement',
  'User',
]

const ROLE_ALIASES = {
  'master admin': 'MasterAdmin',
  masteradmin: 'MasterAdmin',
  'company management': 'CompanyManagement',
  companymanagement: 'CompanyManagement',
  user: 'User',
}

export const DEPARTMENTS = [
  'Management',
  'Engineering',
  'Procurement',
  'Construction',
  'Commissioning',
  'Quality',
  'Safety',
  'Finance',
]

// Modules in the app that can be gated by role.
export const MODULES = {
  SCHEDULE: 'schedule', // Master Schedule (Gantt & S-Curve)
  USER_MANAGEMENT: 'userManagement',
  COMPANY_MANAGEMENT: 'companyManagement',
}

// Per-role module access. '*' means "all modules".
const ROLE_PERMISSIONS = {
  MasterAdmin: ['*'],
  CompanyManagement: [MODULES.COMPANY_MANAGEMENT, MODULES.SCHEDULE],
  User: [MODULES.SCHEDULE],
}

export const asRoleArray = (roles) => {
  if (!roles) return []
  const list = Array.isArray(roles) ? roles : [roles]
  return list
    .filter(Boolean)
    .map((role) => {
      const raw = String(role).trim()
      const normalized = ROLE_ALIASES[raw.toLowerCase().replace(/\s+/g, ' ')]
      return normalized || raw
    })
}

export const isMasterAdmin = (roles) => asRoleArray(roles).includes('MasterAdmin')
export const isCompanyManagement = (roles) => asRoleArray(roles).includes('CompanyManagement')

// Effective permission check across the union of all roles a user holds.
export function hasModuleAccess(roles, moduleName) {
  const list = asRoleArray(roles)
  return list.some((r) => {
    const perms = ROLE_PERMISSIONS[r] || []
    return perms.includes('*') || perms.includes(moduleName)
  })
}

// Convenience used widely for UI gating.
export const canManageUsers = (roles) => isMasterAdmin(roles)
export const canAccessCompanyManagement = (roles) => isMasterAdmin(roles) || isCompanyManagement(roles)

export const ROLE_LABELS = {
  MasterAdmin: 'Master Admin',
  CompanyManagement: 'Company Management',
  User: 'User',
}

export const roleLabel = (r) => ROLE_LABELS[r] || r
