/**
 * Inlined type definitions for admin data structures.
 *
 * These are self-contained copies of the AdminUser and AdminActivityLog
 * interfaces, avoiding any dependency on $lib/types/admin or
 * @tinyland-inc/tinyland-auth at the package level.
 *
 * @module types
 */

/**
 * AdminUser interface - App-specific with username/password schema
 *
 * All field names use consistent camelCase convention.
 * Legacy snake_case fields are preserved for backward compatibility during migration.
 */
export interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  name?: string;
  handle?: string;
  email?: string;
  password?: string;
  passwordHash?: string;
  totpSecret?: string | null;
  totpSecretId?: string | null;
  totpEnabled?: boolean;
  tempPassword?: string;
  qrCode?: string;
  totpUri?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  lastLogin?: string;
  isActive?: boolean;
  firstLogin?: boolean;
  needsOnboarding?: boolean;
  onboardingStep?: number;
  role: string;
  permissions?: string[];
  certificateCn?: string;
  invitedBy?: string;
  invitationToken?: string;
  invitationExpires?: string;
  profileVisibility?: 'private' | 'draft' | 'public';
  profilePhoto?: string;
  bio?: string;
  pronouns?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    theme?: string;
    timezone?: string;
    contentPageSettings?: {
      forceTheme: string | null;
      forceDarkMode: 'light' | 'dark' | null;
      forceA11y: boolean;
    };
  };
  backupCodes?: string[];

  // Legacy fields (deprecated, use camelCase versions above)
  /** @deprecated Use certificateCn instead */
  certificate_cn?: string;
  /** @deprecated Use invitedBy instead */
  invited_by?: string;
  /** @deprecated Use invitationToken instead */
  invitation_token?: string;
}

/**
 * AdminActivityLog interface - Standardized camelCase naming
 *
 * Activity log entries for auditing admin actions.
 */
export interface AdminActivityLog {
  id: string;
  adminUserId: string;
  adminUsername?: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: unknown | null;
  createdAt: string;

  // Legacy fields (deprecated, use camelCase versions above)
  /** @deprecated Use adminUserId instead */
  admin_user_id?: string;
  /** @deprecated Use resourceType instead */
  resource_type?: string;
  /** @deprecated Use resourceId instead */
  resource_id?: string | null;
  /** @deprecated Use ipAddress instead */
  ip_address?: string | null;
  /** @deprecated Use userAgent instead */
  user_agent?: string | null;
  /** @deprecated Use createdAt instead */
  created_at?: string;
}
