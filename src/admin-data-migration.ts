/**
 * Admin data migration utilities
 *
 * Handles file system operations for admin data: ensuring data files exist,
 * migrating from legacy user formats, and creating default admin users.
 *
 * All file system paths and external dependencies (permissions resolver, logger)
 * are injected via the DI config module.
 *
 * @module admin-data-migration
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { AdminUser } from './types.js';
import { getAdminDataConfig, getLogger } from './config.js';
import { transformAdminUserToCamelCase } from './admin-data-transform.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Ensures all required admin data files exist with proper structure
 */
export async function ensureAdminDataFiles(): Promise<void> {
  const { dataDir } = getAdminDataConfig();
  const logger = getLogger();
  const adminUsersFile = path.join(dataDir, 'admin-users.json');
  const adminActivityFile = path.join(dataDir, 'logs', 'admin-activity.json');

  try {
    // Ensure directories exist
    await fs.mkdir(path.join(dataDir, 'logs'), { recursive: true });

    // Check if admin-users.json exists
    try {
      await fs.access(adminUsersFile);
    } catch {
      // Create empty admin-users.json if it doesn't exist
      await fs.writeFile(adminUsersFile, '[]', 'utf8');
    }

    // Check if admin-activity.json exists
    try {
      await fs.access(adminActivityFile);
    } catch {
      // Create empty admin-activity.json if it doesn't exist
      await fs.writeFile(adminActivityFile, '[]', 'utf8');
    }
  } catch (error) {
    logger.error('Error ensuring admin data files:', error);
    throw error;
  }
}

/**
 * Migrates users from legacy users.json to admin-users.json if needed
 */
export async function migrateFromLegacyUsers(): Promise<void> {
  const { dataDir, getRolePermissions } = getAdminDataConfig();
  const logger = getLogger();
  const adminUsersFile = path.join(dataDir, 'admin-users.json');
  const legacyUsersFile = path.join(dataDir, 'users.json');

  try {
    // Check if legacy users file exists
    let legacyData: any[];
    try {
      const content = await fs.readFile(legacyUsersFile, 'utf8');
      legacyData = JSON.parse(content);
    } catch {
      // No legacy file to migrate from
      return;
    }

    // Read current admin users
    const adminContent = await fs.readFile(adminUsersFile, 'utf8');
    const adminUsers = JSON.parse(adminContent) as AdminUser[];
    const adminUserIds = new Set(adminUsers.map(u => u.id));

    // Find users to migrate (those with admin-like properties)
    const usersToMigrate = legacyData.filter((user: any) => {
      // Don't migrate if already exists
      if (adminUserIds.has(user.id)) return false;

      // Migrate if user has admin properties
      return user.role || user.permissions || user.is_admin;
    });

    if (usersToMigrate.length === 0) {
      return;
    }

    // Helper to get default permissions via DI
    const getDefaultPermissions = (role: string): string[] => {
      return getRolePermissions(role);
    };

    // Map legacy users to admin user format with proper transformation
    const migratedUsers: AdminUser[] = usersToMigrate.map((user: any) => transformAdminUserToCamelCase({
      id: user.id,
      username: user.username || user.email || user.handle,
      email: user.email,
      handle: user.handle || user.email?.split('@')[0],
      passwordHash: user.passwordHash || user.password_hash || user.password,
      totpSecretId: user.totpSecretId || user.totp_secret_id || user.totp_secret || null,
      totpEnabled: user.totpEnabled ?? user.totp_enabled ?? false,
      createdAt: user.createdAt || user.created_at || new Date().toISOString(),
      updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
      lastLoginAt: user.lastLoginAt || user.last_login_at || null,
      isActive: user.isActive ?? user.is_active ?? true,
      role: user.role || 'admin',
      certificateCn: user.certificateCn || user.certificate_cn || null,
      permissions: user.permissions || getDefaultPermissions(user.role || 'admin')
    }));

    // Merge with existing admin users
    const allAdminUsers = [...adminUsers, ...migratedUsers];

    // Write back to admin-users.json
    await fs.writeFile(
      adminUsersFile,
      JSON.stringify(allAdminUsers, null, 2),
      'utf8'
    );

    if (process.env.NODE_ENV === 'development') logger.info(`Migrated ${migratedUsers.length} users to admin-users.json`);
  } catch (error) {
    logger.error('Error migrating legacy users:', error);
    // Don't throw - migration is optional
  }
}

/**
 * Creates default admin user if none exist
 */
export async function ensureDefaultAdminUser(): Promise<void> {
  const { dataDir, getRolePermissions } = getAdminDataConfig();
  const logger = getLogger();
  const adminUsersFile = path.join(dataDir, 'admin-users.json');

  try {
    const content = await fs.readFile(adminUsersFile, 'utf8');
    const adminUsers = JSON.parse(content) as AdminUser[];

    // Check if any active admin exists (support both formats during migration)
    const hasActiveAdmin = adminUsers.some(u =>
      u.isActive === true || (u as any).is_active === true
    );
    if (hasActiveAdmin) {
      return;
    }

    // Helper to get default permissions via DI
    const getDefaultPermissions = (role: string): string[] => {
      return getRolePermissions(role);
    };

    // Create default admin user with proper camelCase
    const defaultAdmin: AdminUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'admin',
      email: 'admin@example.com',
      handle: 'admin',
      passwordHash: '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJgccpkRJLYczBMvIW', // "password"
      totpSecretId: null,
      totpEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
      isActive: true,
      role: 'super_admin',
      certificateCn: null,
      permissions: getDefaultPermissions('super_admin')
    };

    // Add to existing users or create new array
    const updatedUsers = adminUsers.length > 0
      ? [...adminUsers, defaultAdmin]
      : [defaultAdmin];

    await fs.writeFile(
      adminUsersFile,
      JSON.stringify(updatedUsers, null, 2),
      'utf8'
    );

    if (process.env.NODE_ENV === 'development') logger.info('Created default admin user (email: admin@example.com, password: password)');
  } catch (error) {
    logger.error('Error ensuring default admin user:', error);
    throw error;
  }
}

/**
 * Runs all migration tasks
 */
export async function runAdminDataMigration(): Promise<void> {
  await ensureAdminDataFiles();
  await migrateFromLegacyUsers();
  await ensureDefaultAdminUser();
}
