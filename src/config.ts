/**
 * Configuration injection for tinyland-admin-data
 *
 * Provides a way to inject external dependencies (logger, data directory,
 * role permissions resolver) without coupling to specific implementations.
 *
 * All config values are optional - sensible defaults are used when
 * no configuration is provided.
 *
 * @module config
 *
 * @example
 * ```typescript
 * import { configureAdminData } from '@tummycrypt/tinyland-admin-data';
 *
 * configureAdminData({
 *   dataDir: '/app/content/auth',
 *   getRolePermissions: (role) => myPermissionService.getPermissions(role),
 *   getLogger: () => myStructuredLogger,
 * });
 * ```
 */

/**
 * Logger interface for structured logging
 */
export interface AdminDataLogger {
	info: (msg: string, ...args: unknown[]) => void;
	warn: (msg: string, ...args: unknown[]) => void;
	error: (msg: string, ...args: unknown[]) => void;
}

/**
 * Configuration options for tinyland-admin-data
 */
export interface AdminDataConfig {
	/** Directory for admin data files. Defaults to process.cwd() + '/content/auth'. */
	dataDir?: string;
	/** Resolve permissions for a given role string. Defaults to returning ['read']. */
	getRolePermissions?: (role: string) => string[];
	/** Logger factory. Defaults to console. */
	getLogger?: () => AdminDataLogger;
}

/** Default no-op-safe logger using console */
const defaultLogger: AdminDataLogger = {
	info: console.log.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console),
};

let config: AdminDataConfig = {};

/**
 * Configure admin-data with external dependencies.
 *
 * Call this once at application startup before using any migration functions.
 * Merges with existing configuration (does not replace).
 *
 * @param c - Configuration options to merge
 */
export function configureAdminData(c: AdminDataConfig): void {
	config = { ...config, ...c };
}

/**
 * Get current configuration with defaults applied.
 *
 * @returns Current merged configuration with defaults
 */
export function getAdminDataConfig(): Required<AdminDataConfig> {
	return {
		dataDir: config.dataDir ?? process.cwd() + '/content/auth',
		getRolePermissions: config.getRolePermissions ?? ((_role: string) => ['read']),
		getLogger: config.getLogger ?? (() => defaultLogger),
	};
}

/**
 * Reset all configuration to empty defaults.
 * Primarily useful for testing.
 */
export function resetAdminDataConfig(): void {
	config = {};
}

/**
 * Get the configured logger instance.
 *
 * @returns Logger instance
 */
export function getLogger(): AdminDataLogger {
	return getAdminDataConfig().getLogger();
}
