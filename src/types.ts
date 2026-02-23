















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
  certificateCn?: string | null;
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

  
  
  certificate_cn?: string;
  
  invited_by?: string;
  
  invitation_token?: string;
}






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

  
  
  admin_user_id?: string;
  
  resource_type?: string;
  
  resource_id?: string | null;
  
  ip_address?: string | null;
  
  user_agent?: string | null;
  
  created_at?: string;
}
