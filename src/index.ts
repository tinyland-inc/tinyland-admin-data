/**
 * @tummycrypt/tinyland-admin-data
 *
 * Admin data transformation and migration utilities.
 * Provides snake_case/camelCase conversion for AdminUser and AdminActivityLog,
 * file-based migration from legacy formats, and default admin user creation.
 *
 * Usage:
 * ```typescript
 * import {
 *   configureAdminData,
 *   transformAdminUserToCamelCase,
 *   runAdminDataMigration,
 * } from '@tummycrypt/tinyland-admin-data';
 *
 * // Configure once at startup
 * configureAdminData({
 *   dataDir: '/app/content/auth',
 *   getRolePermissions: (role) => myPermissionService.getPermissions(role),
 * });
 *
 * // Transform individual records
 * const user = transformAdminUserToCamelCase(rawDbRow);
 *
 * // Run all migrations
 * await runAdminDataMigration();
 * ```
 *
 * @module @tummycrypt/tinyland-admin-data
 */

// Configuration
export {
	configureAdminData,
	getAdminDataConfig,
	resetAdminDataConfig,
	getLogger,
} from './config.js';

export type {
	AdminDataConfig,
	AdminDataLogger,
} from './config.js';

// Types
export type {
	AdminUser,
	AdminActivityLog,
} from './types.js';

// Transform utilities
export {
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
} from './admin-data-transform.js';

// Migration utilities
export {
	ensureAdminDataFiles,
	migrateFromLegacyUsers,
	ensureDefaultAdminUser,
	runAdminDataMigration,
} from './admin-data-migration.js';
