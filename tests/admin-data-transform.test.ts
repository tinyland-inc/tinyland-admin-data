import { describe, it, expect } from 'vitest';
import {
  transformAdminUserToCamelCase,
  transformAdminUserToSnakeCase,
  transformActivityLogToCamelCase,
  transformActivityLogToSnakeCase,
  transformAdminUserArrayToCamelCase,
  transformActivityLogArrayToCamelCase,
  isSnakeCaseAdminUser,
  isSnakeCaseActivityLog,
  migrateAdminUsersFile,
  migrateActivityLogsFile,
} from '../src/admin-data-transform.js';
import type { AdminUser, AdminActivityLog } from '../src/types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const fullCamelCaseUser: AdminUser = {
  id: 'user-1',
  username: 'testuser',
  displayName: 'Test User',
  handle: 'testhandle',
  passwordHash: '$2a$10$hash',
  totpSecretId: 'totp-1',
  totpEnabled: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
  lastLoginAt: '2024-06-15T00:00:00Z',
  isActive: true,
  firstLogin: false,
  needsOnboarding: false,
  onboardingStep: 3,
  role: 'admin',
  permissions: ['read', 'write'],
  certificateCn: 'cn=test',
  invitedBy: 'user-0',
  invitationToken: 'tok-abc',
  invitationExpires: '2025-01-01T00:00:00Z',
  profileVisibility: 'public',
  profilePhoto: 'https://example.com/photo.jpg',
  bio: 'Hello world',
  pronouns: 'they/them',
  socialLinks: { twitter: '@test' },
  preferences: { theme: 'dark' },
  backupCodes: ['code1', 'code2'],
};

const fullSnakeCaseUser: Record<string, unknown> = {
  id: 'user-1',
  username: 'testuser',
  display_name: 'Test User',
  handle: 'testhandle',
  password_hash: '$2a$10$hash',
  totp_secret_id: 'totp-1',
  totp_enabled: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
  last_login_at: '2024-06-15T00:00:00Z',
  is_active: true,
  first_login: false,
  needs_onboarding: false,
  onboarding_step: 3,
  role: 'admin',
  permissions: ['read', 'write'],
  certificate_cn: 'cn=test',
  invited_by: 'user-0',
  invitation_token: 'tok-abc',
  invitation_expires: '2025-01-01T00:00:00Z',
  profile_visibility: 'public',
  profile_photo: 'https://example.com/photo.jpg',
  bio: 'Hello world',
  pronouns: 'they/them',
  social_links: { twitter: '@test' },
  preferences: { theme: 'dark' },
  backup_codes: ['code1', 'code2'],
};

const fullCamelCaseLog: AdminActivityLog = {
  id: 'log-1',
  adminUserId: 'user-1',
  adminUsername: 'testuser',
  action: 'login',
  resourceType: 'session',
  resourceId: 'sess-1',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  details: { browser: 'Chrome' },
  createdAt: '2024-01-01T00:00:00Z',
};

const fullSnakeCaseLog: Record<string, unknown> = {
  id: 'log-1',
  admin_user_id: 'user-1',
  admin_username: 'testuser',
  action: 'login',
  resource_type: 'session',
  resource_id: 'sess-1',
  ip_address: '127.0.0.1',
  user_agent: 'Mozilla/5.0',
  details: { browser: 'Chrome' },
  created_at: '2024-01-01T00:00:00Z',
};

// ===========================================================================
// transformAdminUserToCamelCase
// ===========================================================================
describe('transformAdminUserToCamelCase', () => {
  it('should return null for null input', () => {
    expect(transformAdminUserToCamelCase(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(transformAdminUserToCamelCase(undefined)).toBeUndefined();
  });

  it('should pass through full camelCase input unchanged', () => {
    const result = transformAdminUserToCamelCase(fullCamelCaseUser);
    expect(result.id).toBe('user-1');
    expect(result.username).toBe('testuser');
    expect(result.displayName).toBe('Test User');
    expect(result.handle).toBe('testhandle');
    expect(result.passwordHash).toBe('$2a$10$hash');
    expect(result.totpSecretId).toBe('totp-1');
    expect(result.totpEnabled).toBe(true);
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2024-06-01T00:00:00Z');
    expect(result.lastLoginAt).toBe('2024-06-15T00:00:00Z');
    expect(result.isActive).toBe(true);
    expect(result.firstLogin).toBe(false);
    expect(result.needsOnboarding).toBe(false);
    expect(result.onboardingStep).toBe(3);
    expect(result.role).toBe('admin');
    expect(result.permissions).toEqual(['read', 'write']);
    expect(result.certificateCn).toBe('cn=test');
    expect(result.invitedBy).toBe('user-0');
    expect(result.invitationToken).toBe('tok-abc');
    expect(result.invitationExpires).toBe('2025-01-01T00:00:00Z');
    expect(result.profileVisibility).toBe('public');
    expect(result.profilePhoto).toBe('https://example.com/photo.jpg');
    expect(result.bio).toBe('Hello world');
    expect(result.pronouns).toBe('they/them');
    expect(result.socialLinks).toEqual({ twitter: '@test' });
    expect(result.preferences).toEqual({ theme: 'dark' });
    expect(result.backupCodes).toEqual(['code1', 'code2']);
  });

  it('should convert full snake_case input to camelCase', () => {
    const result = transformAdminUserToCamelCase(fullSnakeCaseUser);
    expect(result.id).toBe('user-1');
    expect(result.username).toBe('testuser');
    expect(result.displayName).toBe('Test User');
    expect(result.handle).toBe('testhandle');
    expect(result.passwordHash).toBe('$2a$10$hash');
    expect(result.totpSecretId).toBe('totp-1');
    expect(result.totpEnabled).toBe(true);
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2024-06-01T00:00:00Z');
    expect(result.lastLoginAt).toBe('2024-06-15T00:00:00Z');
    expect(result.isActive).toBe(true);
    expect(result.firstLogin).toBe(false);
    expect(result.needsOnboarding).toBe(false);
    expect(result.onboardingStep).toBe(3);
    expect(result.role).toBe('admin');
    expect(result.permissions).toEqual(['read', 'write']);
    expect(result.certificateCn).toBe('cn=test');
    expect(result.invitedBy).toBe('user-0');
    expect(result.invitationToken).toBe('tok-abc');
    expect(result.invitationExpires).toBe('2025-01-01T00:00:00Z');
    expect(result.profileVisibility).toBe('public');
    expect(result.profilePhoto).toBe('https://example.com/photo.jpg');
    expect(result.bio).toBe('Hello world');
    expect(result.pronouns).toBe('they/them');
    expect(result.socialLinks).toEqual({ twitter: '@test' });
    expect(result.preferences).toEqual({ theme: 'dark' });
    expect(result.backupCodes).toEqual(['code1', 'code2']);
  });

  it('should handle mixed format input (some camelCase, some snake_case)', () => {
    const mixed = {
      id: 'user-2',
      username: 'mixed',
      displayName: 'Mixed',
      password_hash: 'hash123',
      totp_enabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
      is_active: false,
      role: 'editor',
    };
    const result = transformAdminUserToCamelCase(mixed);
    expect(result.displayName).toBe('Mixed');
    expect(result.passwordHash).toBe('hash123');
    expect(result.totpEnabled).toBe(true);
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result.updatedAt).toBe('2024-02-01T00:00:00Z');
    expect(result.isActive).toBe(false);
  });

  it('should default isActive to true when both formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.isActive).toBe(true);
  });

  it('should default totpEnabled to false when both formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.totpEnabled).toBe(false);
  });

  it('should default firstLogin to false when both formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.firstLogin).toBe(false);
  });

  it('should default needsOnboarding to false when both formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.needsOnboarding).toBe(false);
  });

  it('should default onboardingStep to 0 when both formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.onboardingStep).toBe(0);
  });

  it('should default permissions to empty array when missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.permissions).toEqual([]);
  });

  it('should default lastLoginAt to null when both formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.lastLoginAt).toBeNull();
  });

  it('should default totpSecretId to null when all formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.totpSecretId).toBeNull();
  });

  it('should default certificateCn to null when both formats missing', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.certificateCn).toBeNull();
  });

  it('should prefer camelCase displayName over snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', displayName: 'Camel', display_name: 'Snake' };
    expect(transformAdminUserToCamelCase(user).displayName).toBe('Camel');
  });

  it('should prefer camelCase passwordHash over snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', passwordHash: 'camelHash', password_hash: 'snakeHash' };
    expect(transformAdminUserToCamelCase(user).passwordHash).toBe('camelHash');
  });

  it('should resolve totpSecretId from totp_secret fallback', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', totp_secret: 'secret-val' };
    expect(transformAdminUserToCamelCase(user).totpSecretId).toBe('secret-val');
  });

  it('should use isActive=false from camelCase when present', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', isActive: false };
    expect(transformAdminUserToCamelCase(user).isActive).toBe(false);
  });

  it('should use is_active=false from snake_case when camelCase absent', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', is_active: false };
    expect(transformAdminUserToCamelCase(user).isActive).toBe(false);
  });

  it('should use totpEnabled=true from snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', totp_enabled: true };
    expect(transformAdminUserToCamelCase(user).totpEnabled).toBe(true);
  });

  it('should use firstLogin=true from snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', first_login: true };
    expect(transformAdminUserToCamelCase(user).firstLogin).toBe(true);
  });

  it('should use needsOnboarding=true from snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', needs_onboarding: true };
    expect(transformAdminUserToCamelCase(user).needsOnboarding).toBe(true);
  });

  it('should use onboardingStep from snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', onboarding_step: 5 };
    expect(transformAdminUserToCamelCase(user).onboardingStep).toBe(5);
  });

  it('should preserve bio as undefined when not provided', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    expect(transformAdminUserToCamelCase(user).bio).toBeUndefined();
  });

  it('should preserve pronouns as undefined when not provided', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    expect(transformAdminUserToCamelCase(user).pronouns).toBeUndefined();
  });

  it('should preserve preferences as undefined when not provided', () => {
    const user = { id: 'u1', username: 'x', role: 'admin' };
    expect(transformAdminUserToCamelCase(user).preferences).toBeUndefined();
  });

  it('should handle empty string fields without coercing to undefined', () => {
    const user = { id: 'u1', username: '', role: 'admin', bio: '' };
    const result = transformAdminUserToCamelCase(user);
    expect(result.username).toBe('');
    expect(result.bio).toBe('');
  });

  it('should prefer camelCase invitedBy over snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', invitedBy: 'camel', invited_by: 'snake' };
    expect(transformAdminUserToCamelCase(user).invitedBy).toBe('camel');
  });

  it('should prefer camelCase createdAt over snake_case', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', createdAt: 'camel-ts', created_at: 'snake-ts' };
    expect(transformAdminUserToCamelCase(user).createdAt).toBe('camel-ts');
  });

  it('should fallback socialLinks from social_links', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', social_links: { twitter: '@t' } };
    expect(transformAdminUserToCamelCase(user).socialLinks).toEqual({ twitter: '@t' });
  });

  it('should fallback backupCodes from backup_codes', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', backup_codes: ['a', 'b'] };
    expect(transformAdminUserToCamelCase(user).backupCodes).toEqual(['a', 'b']);
  });

  it('should fallback profilePhoto from profile_photo', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', profile_photo: 'pic.jpg' };
    expect(transformAdminUserToCamelCase(user).profilePhoto).toBe('pic.jpg');
  });

  it('should fallback profileVisibility from profile_visibility', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', profile_visibility: 'private' };
    expect(transformAdminUserToCamelCase(user).profileVisibility).toBe('private');
  });

  it('should fallback invitationToken from invitation_token', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', invitation_token: 'token-123' };
    expect(transformAdminUserToCamelCase(user).invitationToken).toBe('token-123');
  });

  it('should fallback invitationExpires from invitation_expires', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', invitation_expires: '2025-12-31' };
    expect(transformAdminUserToCamelCase(user).invitationExpires).toBe('2025-12-31');
  });

  it('should fallback certificateCn from certificate_cn', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', certificate_cn: 'cn=cert' };
    expect(transformAdminUserToCamelCase(user).certificateCn).toBe('cn=cert');
  });

  it('should handle user with numeric onboardingStep=0 correctly (falsy but valid)', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', onboardingStep: 0 };
    expect(transformAdminUserToCamelCase(user).onboardingStep).toBe(0);
  });
});

// ===========================================================================
// transformAdminUserToSnakeCase
// ===========================================================================
describe('transformAdminUserToSnakeCase', () => {
  it('should convert full camelCase user to snake_case', () => {
    const result = transformAdminUserToSnakeCase(fullCamelCaseUser);
    expect(result.id).toBe('user-1');
    expect(result.username).toBe('testuser');
    expect(result.display_name).toBe('Test User');
    expect(result.handle).toBe('testhandle');
    expect(result.password_hash).toBe('$2a$10$hash');
    expect(result.totp_secret_id).toBe('totp-1');
    expect(result.totp_enabled).toBe(true);
    expect(result.created_at).toBe('2024-01-01T00:00:00Z');
    expect(result.updated_at).toBe('2024-06-01T00:00:00Z');
    expect(result.last_login_at).toBe('2024-06-15T00:00:00Z');
    expect(result.is_active).toBe(true);
    expect(result.first_login).toBe(false);
    expect(result.needs_onboarding).toBe(false);
    expect(result.onboarding_step).toBe(3);
    expect(result.role).toBe('admin');
    expect(result.permissions).toEqual(['read', 'write']);
    expect(result.certificate_cn).toBe('cn=test');
    expect(result.invited_by).toBe('user-0');
    expect(result.invitation_token).toBe('tok-abc');
    expect(result.invitation_expires).toBe('2025-01-01T00:00:00Z');
    expect(result.profile_visibility).toBe('public');
    expect(result.profile_photo).toBe('https://example.com/photo.jpg');
    expect(result.bio).toBe('Hello world');
    expect(result.pronouns).toBe('they/them');
    expect(result.social_links).toEqual({ twitter: '@test' });
    expect(result.preferences).toEqual({ theme: 'dark' });
    expect(result.backup_codes).toEqual(['code1', 'code2']);
  });

  it('should preserve undefined optional fields as undefined in snake_case', () => {
    const minimal: AdminUser = { id: 'u1', username: 'x', role: 'admin' };
    const result = transformAdminUserToSnakeCase(minimal);
    expect(result.display_name).toBeUndefined();
    expect(result.password_hash).toBeUndefined();
    expect(result.bio).toBeUndefined();
  });

  it('should map null fields correctly', () => {
    const user: AdminUser = {
      id: 'u1', username: 'x', role: 'admin',
      totpSecretId: null, lastLoginAt: null, certificateCn: null,
    };
    const result = transformAdminUserToSnakeCase(user);
    expect(result.totp_secret_id).toBeNull();
    expect(result.last_login_at).toBeNull();
    expect(result.certificate_cn).toBeNull();
  });

  it('should be the inverse of toCamelCase for a round-trip', () => {
    const roundTripped = transformAdminUserToCamelCase(
      transformAdminUserToSnakeCase(fullCamelCaseUser)
    );
    expect(roundTripped.id).toBe(fullCamelCaseUser.id);
    expect(roundTripped.username).toBe(fullCamelCaseUser.username);
    expect(roundTripped.displayName).toBe(fullCamelCaseUser.displayName);
    expect(roundTripped.role).toBe(fullCamelCaseUser.role);
    expect(roundTripped.isActive).toBe(fullCamelCaseUser.isActive);
  });
});

// ===========================================================================
// transformActivityLogToCamelCase
// ===========================================================================
describe('transformActivityLogToCamelCase', () => {
  it('should return null for null input', () => {
    expect(transformActivityLogToCamelCase(null)).toBeNull();
  });

  it('should return undefined for undefined input', () => {
    expect(transformActivityLogToCamelCase(undefined)).toBeUndefined();
  });

  it('should pass through camelCase log unchanged', () => {
    const result = transformActivityLogToCamelCase(fullCamelCaseLog);
    expect(result.id).toBe('log-1');
    expect(result.adminUserId).toBe('user-1');
    expect(result.adminUsername).toBe('testuser');
    expect(result.action).toBe('login');
    expect(result.resourceType).toBe('session');
    expect(result.resourceId).toBe('sess-1');
    expect(result.ipAddress).toBe('127.0.0.1');
    expect(result.userAgent).toBe('Mozilla/5.0');
    expect(result.details).toEqual({ browser: 'Chrome' });
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
  });

  it('should convert snake_case log to camelCase', () => {
    const result = transformActivityLogToCamelCase(fullSnakeCaseLog);
    expect(result.id).toBe('log-1');
    expect(result.adminUserId).toBe('user-1');
    expect(result.adminUsername).toBe('testuser');
    expect(result.action).toBe('login');
    expect(result.resourceType).toBe('session');
    expect(result.resourceId).toBe('sess-1');
    expect(result.ipAddress).toBe('127.0.0.1');
    expect(result.userAgent).toBe('Mozilla/5.0');
    expect(result.details).toEqual({ browser: 'Chrome' });
    expect(result.createdAt).toBe('2024-01-01T00:00:00Z');
  });

  it('should default resourceId to null when missing', () => {
    const log = { id: 'l1', adminUserId: 'u1', action: 'test', resourceType: 'x', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).resourceId).toBeNull();
  });

  it('should default ipAddress to null when missing', () => {
    const log = { id: 'l1', adminUserId: 'u1', action: 'test', resourceType: 'x', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).ipAddress).toBeNull();
  });

  it('should default userAgent to null when missing', () => {
    const log = { id: 'l1', adminUserId: 'u1', action: 'test', resourceType: 'x', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).userAgent).toBeNull();
  });

  it('should default details to null when missing', () => {
    const log = { id: 'l1', adminUserId: 'u1', action: 'test', resourceType: 'x', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).details).toBeNull();
  });

  it('should prefer camelCase adminUserId over snake_case', () => {
    const log = { id: 'l1', adminUserId: 'camel-id', admin_user_id: 'snake-id', action: 'x', resourceType: 'y', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).adminUserId).toBe('camel-id');
  });

  it('should prefer camelCase resourceType over snake_case', () => {
    const log = { id: 'l1', adminUserId: 'u', action: 'x', resourceType: 'camelType', resource_type: 'snakeType', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).resourceType).toBe('camelType');
  });

  it('should handle mixed format log', () => {
    const log = { id: 'l1', adminUserId: 'u', admin_username: 'snake_name', action: 'x', resource_type: 'r', createdAt: 'ts' };
    const result = transformActivityLogToCamelCase(log);
    expect(result.adminUserId).toBe('u');
    expect(result.adminUsername).toBe('snake_name');
    expect(result.resourceType).toBe('r');
  });

  it('should use resource_id from snake_case when resourceId absent', () => {
    const log = { id: 'l1', adminUserId: 'u', action: 'x', resourceType: 'r', resource_id: 'rid', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).resourceId).toBe('rid');
  });

  it('should use ip_address from snake_case when ipAddress absent', () => {
    const log = { id: 'l1', adminUserId: 'u', action: 'x', resourceType: 'r', ip_address: '10.0.0.1', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).ipAddress).toBe('10.0.0.1');
  });

  it('should use user_agent from snake_case when userAgent absent', () => {
    const log = { id: 'l1', adminUserId: 'u', action: 'x', resourceType: 'r', user_agent: 'Bot/1.0', createdAt: 'ts' };
    expect(transformActivityLogToCamelCase(log).userAgent).toBe('Bot/1.0');
  });

  it('should use created_at from snake_case when createdAt absent', () => {
    const log = { id: 'l1', adminUserId: 'u', action: 'x', resourceType: 'r', created_at: '2024-05-05' };
    expect(transformActivityLogToCamelCase(log).createdAt).toBe('2024-05-05');
  });
});

// ===========================================================================
// transformActivityLogToSnakeCase
// ===========================================================================
describe('transformActivityLogToSnakeCase', () => {
  it('should convert full camelCase log to snake_case', () => {
    const result = transformActivityLogToSnakeCase(fullCamelCaseLog);
    expect(result.id).toBe('log-1');
    expect(result.admin_user_id).toBe('user-1');
    expect(result.admin_username).toBe('testuser');
    expect(result.action).toBe('login');
    expect(result.resource_type).toBe('session');
    expect(result.resource_id).toBe('sess-1');
    expect(result.ip_address).toBe('127.0.0.1');
    expect(result.user_agent).toBe('Mozilla/5.0');
    expect(result.details).toEqual({ browser: 'Chrome' });
    expect(result.created_at).toBe('2024-01-01T00:00:00Z');
  });

  it('should preserve null fields in snake_case output', () => {
    const log: AdminActivityLog = {
      id: 'l1', adminUserId: 'u1', action: 'test', resourceType: 'x',
      resourceId: null, ipAddress: null, userAgent: null, details: null, createdAt: 'ts',
    };
    const result = transformActivityLogToSnakeCase(log);
    expect(result.resource_id).toBeNull();
    expect(result.ip_address).toBeNull();
    expect(result.user_agent).toBeNull();
    expect(result.details).toBeNull();
  });

  it('should be the inverse of toCamelCase for a round-trip', () => {
    const roundTripped = transformActivityLogToCamelCase(
      transformActivityLogToSnakeCase(fullCamelCaseLog)
    );
    expect(roundTripped.id).toBe(fullCamelCaseLog.id);
    expect(roundTripped.adminUserId).toBe(fullCamelCaseLog.adminUserId);
    expect(roundTripped.action).toBe(fullCamelCaseLog.action);
    expect(roundTripped.resourceType).toBe(fullCamelCaseLog.resourceType);
  });
});

// ===========================================================================
// transformAdminUserArrayToCamelCase
// ===========================================================================
describe('transformAdminUserArrayToCamelCase', () => {
  it('should return empty array for empty input', () => {
    expect(transformAdminUserArrayToCamelCase([])).toEqual([]);
  });

  it('should transform all users in the array', () => {
    const users = [
      { id: 'u1', username: 'a', role: 'admin', password_hash: 'h1' },
      { id: 'u2', username: 'b', role: 'editor', passwordHash: 'h2' },
    ];
    const result = transformAdminUserArrayToCamelCase(users);
    expect(result).toHaveLength(2);
    expect(result[0].passwordHash).toBe('h1');
    expect(result[1].passwordHash).toBe('h2');
  });

  it('should transform mixed format array to all camelCase', () => {
    const users = [
      fullSnakeCaseUser,
      fullCamelCaseUser,
      { id: 'u3', username: 'c', role: 'viewer', display_name: 'C', createdAt: 'ts' },
    ];
    const result = transformAdminUserArrayToCamelCase(users);
    expect(result).toHaveLength(3);
    expect(result[0].displayName).toBe('Test User');
    expect(result[1].displayName).toBe('Test User');
    expect(result[2].displayName).toBe('C');
  });

  it('should handle single-element array', () => {
    const result = transformAdminUserArrayToCamelCase([fullSnakeCaseUser]);
    expect(result).toHaveLength(1);
    expect(result[0].passwordHash).toBe('$2a$10$hash');
  });
});

// ===========================================================================
// transformActivityLogArrayToCamelCase
// ===========================================================================
describe('transformActivityLogArrayToCamelCase', () => {
  it('should return empty array for empty input', () => {
    expect(transformActivityLogArrayToCamelCase([])).toEqual([]);
  });

  it('should transform all logs in the array', () => {
    const logs = [fullSnakeCaseLog, fullCamelCaseLog];
    const result = transformActivityLogArrayToCamelCase(logs);
    expect(result).toHaveLength(2);
    expect(result[0].adminUserId).toBe('user-1');
    expect(result[1].adminUserId).toBe('user-1');
  });

  it('should handle single-element array', () => {
    const result = transformActivityLogArrayToCamelCase([fullSnakeCaseLog]);
    expect(result).toHaveLength(1);
    expect(result[0].resourceType).toBe('session');
  });
});

// ===========================================================================
// isSnakeCaseAdminUser
// ===========================================================================
describe('isSnakeCaseAdminUser', () => {
  it('should return true when password_hash is present', () => {
    expect(isSnakeCaseAdminUser({ password_hash: 'h' })).toBe(true);
  });

  it('should return true when totp_secret_id is present', () => {
    expect(isSnakeCaseAdminUser({ totp_secret_id: 'x' })).toBe(true);
  });

  it('should return true when totp_enabled is present', () => {
    expect(isSnakeCaseAdminUser({ totp_enabled: true })).toBe(true);
  });

  it('should return true when created_at is present', () => {
    expect(isSnakeCaseAdminUser({ created_at: 'ts' })).toBe(true);
  });

  it('should return true when updated_at is present', () => {
    expect(isSnakeCaseAdminUser({ updated_at: 'ts' })).toBe(true);
  });

  it('should return true when last_login_at is present', () => {
    expect(isSnakeCaseAdminUser({ last_login_at: 'ts' })).toBe(true);
  });

  it('should return true when is_active is present', () => {
    expect(isSnakeCaseAdminUser({ is_active: true })).toBe(true);
  });

  it('should return true when certificate_cn is present', () => {
    expect(isSnakeCaseAdminUser({ certificate_cn: 'cn' })).toBe(true);
  });

  it('should return true when invited_by is present', () => {
    expect(isSnakeCaseAdminUser({ invited_by: 'u' })).toBe(true);
  });

  it('should return true when invitation_token is present', () => {
    expect(isSnakeCaseAdminUser({ invitation_token: 't' })).toBe(true);
  });

  it('should return false for pure camelCase user', () => {
    expect(isSnakeCaseAdminUser(fullCamelCaseUser)).toBe(false);
  });

  it('should return true for full snake_case user', () => {
    expect(isSnakeCaseAdminUser(fullSnakeCaseUser)).toBe(true);
  });

  it('should return false for empty object', () => {
    expect(isSnakeCaseAdminUser({})).toBe(false);
  });

  it('should return true when even one snake_case field is present alongside camelCase', () => {
    expect(isSnakeCaseAdminUser({ passwordHash: 'h', created_at: 'ts' })).toBe(true);
  });
});

// ===========================================================================
// isSnakeCaseActivityLog
// ===========================================================================
describe('isSnakeCaseActivityLog', () => {
  it('should return true when admin_user_id is present', () => {
    expect(isSnakeCaseActivityLog({ admin_user_id: 'u' })).toBe(true);
  });

  it('should return true when resource_type is present', () => {
    expect(isSnakeCaseActivityLog({ resource_type: 'r' })).toBe(true);
  });

  it('should return true when resource_id is present', () => {
    expect(isSnakeCaseActivityLog({ resource_id: 'r' })).toBe(true);
  });

  it('should return true when ip_address is present', () => {
    expect(isSnakeCaseActivityLog({ ip_address: '1.2.3.4' })).toBe(true);
  });

  it('should return true when user_agent is present', () => {
    expect(isSnakeCaseActivityLog({ user_agent: 'Bot' })).toBe(true);
  });

  it('should return true when created_at is present', () => {
    expect(isSnakeCaseActivityLog({ created_at: 'ts' })).toBe(true);
  });

  it('should return false for pure camelCase log', () => {
    expect(isSnakeCaseActivityLog(fullCamelCaseLog)).toBe(false);
  });

  it('should return true for full snake_case log', () => {
    expect(isSnakeCaseActivityLog(fullSnakeCaseLog)).toBe(true);
  });

  it('should return false for empty object', () => {
    expect(isSnakeCaseActivityLog({})).toBe(false);
  });
});

// ===========================================================================
// migrateAdminUsersFile
// ===========================================================================
describe('migrateAdminUsersFile', () => {
  it('should handle array format', () => {
    const data = [
      { id: 'u1', username: 'a', role: 'admin', password_hash: 'h' },
    ];
    const result = migrateAdminUsersFile(data);
    expect(result).toHaveLength(1);
    expect(result[0].passwordHash).toBe('h');
  });

  it('should handle object with users property', () => {
    const data = {
      users: [
        { id: 'u1', username: 'a', role: 'admin', display_name: 'A' },
      ],
    };
    const result = migrateAdminUsersFile(data);
    expect(result).toHaveLength(1);
    expect(result[0].displayName).toBe('A');
  });

  it('should return empty array for empty array input', () => {
    expect(migrateAdminUsersFile([])).toEqual([]);
  });

  it('should return empty array for object with empty users', () => {
    expect(migrateAdminUsersFile({ users: [] })).toEqual([]);
  });

  it('should return empty array for object with missing users property', () => {
    expect(migrateAdminUsersFile({})).toEqual([]);
  });

  it('should transform mixed format users in file data', () => {
    const data = [
      { id: 'u1', username: 'a', role: 'admin', password_hash: 'h1' },
      { id: 'u2', username: 'b', role: 'editor', passwordHash: 'h2' },
    ];
    const result = migrateAdminUsersFile(data);
    expect(result[0].passwordHash).toBe('h1');
    expect(result[1].passwordHash).toBe('h2');
  });
});

// ===========================================================================
// migrateActivityLogsFile
// ===========================================================================
describe('migrateActivityLogsFile', () => {
  it('should handle array format', () => {
    const data = [fullSnakeCaseLog];
    const result = migrateActivityLogsFile(data);
    expect(result).toHaveLength(1);
    expect(result[0].adminUserId).toBe('user-1');
  });

  it('should handle object with logs property', () => {
    const data = { logs: [fullCamelCaseLog] };
    const result = migrateActivityLogsFile(data);
    expect(result).toHaveLength(1);
    expect(result[0].adminUserId).toBe('user-1');
  });

  it('should return empty array for empty array input', () => {
    expect(migrateActivityLogsFile([])).toEqual([]);
  });

  it('should return empty array for object with empty logs', () => {
    expect(migrateActivityLogsFile({ logs: [] })).toEqual([]);
  });

  it('should return empty array for object with missing logs property', () => {
    expect(migrateActivityLogsFile({})).toEqual([]);
  });

  it('should transform multiple mixed-format logs', () => {
    const data = [fullSnakeCaseLog, fullCamelCaseLog];
    const result = migrateActivityLogsFile(data);
    expect(result).toHaveLength(2);
    result.forEach(log => {
      expect(log.adminUserId).toBe('user-1');
      expect(log.resourceType).toBe('session');
    });
  });
});

// ===========================================================================
// Additional edge case tests
// ===========================================================================
describe('transformAdminUserToCamelCase - additional edge cases', () => {
  it('should handle false values for boolean fields (not coerce to default)', () => {
    const user = {
      id: 'u1', username: 'x', role: 'admin',
      isActive: false, totpEnabled: false, firstLogin: false, needsOnboarding: false,
    };
    const result = transformAdminUserToCamelCase(user);
    expect(result.isActive).toBe(false);
    expect(result.totpEnabled).toBe(false);
    expect(result.firstLogin).toBe(false);
    expect(result.needsOnboarding).toBe(false);
  });

  it('should handle 0 for onboardingStep as valid value', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', onboarding_step: 0 };
    expect(transformAdminUserToCamelCase(user).onboardingStep).toBe(0);
  });

  it('should handle empty arrays for permissions and backupCodes', () => {
    const user = { id: 'u1', username: 'x', role: 'admin', permissions: [], backup_codes: [] };
    const result = transformAdminUserToCamelCase(user);
    expect(result.permissions).toEqual([]);
    expect(result.backupCodes).toEqual([]);
  });

  it('should handle deeply nested preferences object', () => {
    const user = {
      id: 'u1', username: 'x', role: 'admin',
      preferences: {
        theme: 'dark',
        contentPageSettings: { forceTheme: 'minimal', forceDarkMode: 'dark', forceA11y: true },
      },
    };
    const result = transformAdminUserToCamelCase(user);
    expect(result.preferences?.contentPageSettings?.forceTheme).toBe('minimal');
    expect(result.preferences?.contentPageSettings?.forceA11y).toBe(true);
  });

  it('should handle socialLinks with all platforms', () => {
    const user = {
      id: 'u1', username: 'x', role: 'admin',
      social_links: { twitter: '@t', instagram: '@i', facebook: 'fb' },
    };
    const result = transformAdminUserToCamelCase(user);
    expect(result.socialLinks).toEqual({ twitter: '@t', instagram: '@i', facebook: 'fb' });
  });

  it('should handle all three profileVisibility options', () => {
    for (const vis of ['private', 'draft', 'public'] as const) {
      const user = { id: 'u1', username: 'x', role: 'admin', profile_visibility: vis };
      expect(transformAdminUserToCamelCase(user).profileVisibility).toBe(vis);
    }
  });
});

describe('transformActivityLogToCamelCase - additional edge cases', () => {
  it('should handle details as complex nested object', () => {
    const log = {
      id: 'l1', admin_user_id: 'u', action: 'test', resource_type: 'r',
      details: { nested: { deep: true }, list: [1, 2, 3] },
      created_at: 'ts',
    };
    const result = transformActivityLogToCamelCase(log);
    expect(result.details).toEqual({ nested: { deep: true }, list: [1, 2, 3] });
  });

  it('should handle null resource_id from snake_case (falsy but explicit null)', () => {
    const log = { id: 'l1', admin_user_id: 'u', action: 'x', resource_type: 'r', resource_id: null, created_at: 'ts' };
    expect(transformActivityLogToCamelCase(log).resourceId).toBeNull();
  });
});
