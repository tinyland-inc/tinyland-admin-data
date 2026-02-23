








import type { AdminUser, AdminActivityLog } from './types.js';







export function transformAdminUserToCamelCase(user: any): AdminUser {
  
  if (!user) return user;

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName || user.display_name,
    handle: user.handle,
    passwordHash: user.passwordHash || user.password_hash,
    totpSecretId: user.totpSecretId || user.totp_secret_id || user.totp_secret || null,
    totpEnabled: user.totpEnabled ?? user.totp_enabled ?? false,
    createdAt: user.createdAt || user.created_at,
    updatedAt: user.updatedAt || user.updated_at,
    lastLoginAt: user.lastLoginAt || user.last_login_at || null,
    isActive: user.isActive ?? user.is_active ?? true,
    firstLogin: user.firstLogin ?? user.first_login ?? false,
    needsOnboarding: user.needsOnboarding ?? user.needs_onboarding ?? false,
    onboardingStep: user.onboardingStep ?? user.onboarding_step ?? 0,
    role: user.role,
    permissions: user.permissions || [],
    certificateCn: user.certificateCn || user.certificate_cn || null,
    invitedBy: user.invitedBy || user.invited_by,
    invitationToken: user.invitationToken || user.invitation_token,
    invitationExpires: user.invitationExpires || user.invitation_expires,
    profileVisibility: user.profileVisibility || user.profile_visibility,
    profilePhoto: user.profilePhoto || user.profile_photo,
    bio: user.bio,
    pronouns: user.pronouns,
    socialLinks: user.socialLinks || user.social_links,
    preferences: user.preferences,
    backupCodes: user.backupCodes || user.backup_codes
  };
}





export function transformAdminUserToSnakeCase(user: AdminUser): any {
  return {
    id: user.id,
    username: user.username,
    display_name: user.displayName,
    handle: user.handle,
    password_hash: user.passwordHash,
    totp_secret_id: user.totpSecretId,
    totp_enabled: user.totpEnabled,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    last_login_at: user.lastLoginAt,
    is_active: user.isActive,
    first_login: user.firstLogin,
    needs_onboarding: user.needsOnboarding,
    onboarding_step: user.onboardingStep,
    role: user.role,
    permissions: user.permissions,
    certificate_cn: user.certificateCn,
    invited_by: user.invitedBy,
    invitation_token: user.invitationToken,
    invitation_expires: user.invitationExpires,
    profile_visibility: user.profileVisibility,
    profile_photo: user.profilePhoto,
    bio: user.bio,
    pronouns: user.pronouns,
    social_links: user.socialLinks,
    preferences: user.preferences,
    backup_codes: user.backupCodes
  };
}




export function transformActivityLogToCamelCase(log: any): AdminActivityLog {
  if (!log) return log;

  return {
    id: log.id,
    adminUserId: log.adminUserId || log.admin_user_id,
    adminUsername: log.adminUsername || log.admin_username,
    action: log.action,
    resourceType: log.resourceType || log.resource_type,
    resourceId: log.resourceId ?? log.resource_id ?? null,
    ipAddress: log.ipAddress ?? log.ip_address ?? null,
    userAgent: log.userAgent ?? log.user_agent ?? null,
    details: log.details ?? null,
    createdAt: log.createdAt || log.created_at
  };
}




export function transformActivityLogToSnakeCase(log: AdminActivityLog): any {
  return {
    id: log.id,
    admin_user_id: log.adminUserId,
    admin_username: log.adminUsername,
    action: log.action,
    resource_type: log.resourceType,
    resource_id: log.resourceId,
    ip_address: log.ipAddress,
    user_agent: log.userAgent,
    details: log.details,
    created_at: log.createdAt
  };
}




export function transformAdminUserArrayToCamelCase(users: any[]): AdminUser[] {
  return users.map(transformAdminUserToCamelCase);
}




export function transformActivityLogArrayToCamelCase(logs: any[]): AdminActivityLog[] {
  return logs.map(transformActivityLogToCamelCase);
}




export function isSnakeCaseAdminUser(user: any): boolean {
  const snakeCaseFields = [
    'password_hash',
    'totp_secret_id',
    'totp_enabled',
    'created_at',
    'updated_at',
    'last_login_at',
    'is_active',
    'certificate_cn',
    'invited_by',
    'invitation_token'
  ];

  return snakeCaseFields.some(field => field in user);
}




export function isSnakeCaseActivityLog(log: any): boolean {
  const snakeCaseFields = [
    'admin_user_id',
    'resource_type',
    'resource_id',
    'ip_address',
    'user_agent',
    'created_at'
  ];

  return snakeCaseFields.some(field => field in log);
}




export function migrateAdminUsersFile(data: any): AdminUser[] {
  
  const users = Array.isArray(data) ? data : (data.users || []);
  return transformAdminUserArrayToCamelCase(users);
}




export function migrateActivityLogsFile(data: any): AdminActivityLog[] {
  const logs = Array.isArray(data) ? data : (data.logs || []);
  return transformActivityLogArrayToCamelCase(logs);
}
