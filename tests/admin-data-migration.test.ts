import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureAdminData, resetAdminDataConfig } from '../src/config.js';




vi.mock('fs', () => {
  const fsMock = {
    mkdir: vi.fn(),
    access: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
  };
  return {
    promises: fsMock,
    default: { promises: fsMock },
  };
});

import { promises as fs } from 'fs';
import {
  ensureAdminDataFiles,
  migrateFromLegacyUsers,
  ensureDefaultAdminUser,
  runAdminDataMigration,
} from '../src/admin-data-migration.js';

const mockFs = fs as unknown as {
  mkdir: ReturnType<typeof vi.fn>;
  access: ReturnType<typeof vi.fn>;
  writeFile: ReturnType<typeof vi.fn>;
  readFile: ReturnType<typeof vi.fn>;
};




beforeEach(() => {
  vi.clearAllMocks();
  resetAdminDataConfig();
  configureAdminData({
    dataDir: '/test/data',
    getRolePermissions: (role: string) => {
      if (role === 'super_admin') return ['all'];
      if (role === 'admin') return ['read', 'write', 'manage'];
      return ['read'];
    },
  });
  
  mockFs.mkdir.mockResolvedValue(undefined);
  mockFs.access.mockResolvedValue(undefined);
  mockFs.writeFile.mockResolvedValue(undefined);
  mockFs.readFile.mockResolvedValue('[]');
});

afterEach(() => {
  resetAdminDataConfig();
});




describe('ensureAdminDataFiles', () => {
  it('should create the logs directory recursively', async () => {
    await ensureAdminDataFiles();
    expect(mockFs.mkdir).toHaveBeenCalledWith('/test/data/logs', { recursive: true });
  });

  it('should check admin-users.json exists', async () => {
    await ensureAdminDataFiles();
    expect(mockFs.access).toHaveBeenCalledWith('/test/data/admin-users.json');
  });

  it('should check admin-activity.json exists', async () => {
    await ensureAdminDataFiles();
    expect(mockFs.access).toHaveBeenCalledWith('/test/data/logs/admin-activity.json');
  });

  it('should create admin-users.json when it does not exist', async () => {
    mockFs.access.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/admin-users.json') {
        return Promise.reject(new Error('ENOENT'));
      }
      return Promise.resolve(undefined);
    });
    await ensureAdminDataFiles();
    expect(mockFs.writeFile).toHaveBeenCalledWith('/test/data/admin-users.json', '[]', 'utf8');
  });

  it('should create admin-activity.json when it does not exist', async () => {
    mockFs.access.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/logs/admin-activity.json') {
        return Promise.reject(new Error('ENOENT'));
      }
      return Promise.resolve(undefined);
    });
    await ensureAdminDataFiles();
    expect(mockFs.writeFile).toHaveBeenCalledWith('/test/data/logs/admin-activity.json', '[]', 'utf8');
  });

  it('should create both files when neither exists', async () => {
    mockFs.access.mockRejectedValue(new Error('ENOENT'));
    await ensureAdminDataFiles();
    expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
  });

  it('should not write files when both already exist', async () => {
    mockFs.access.mockResolvedValue(undefined);
    await ensureAdminDataFiles();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it('should throw when mkdir fails', async () => {
    mockFs.mkdir.mockRejectedValue(new Error('EPERM'));
    await expect(ensureAdminDataFiles()).rejects.toThrow('EPERM');
  });

  it('should throw when writeFile fails for admin-users.json', async () => {
    mockFs.access.mockRejectedValue(new Error('ENOENT'));
    mockFs.writeFile.mockRejectedValueOnce(new Error('ENOSPC'));
    await expect(ensureAdminDataFiles()).rejects.toThrow('ENOSPC');
  });

  it('should use custom dataDir from config', async () => {
    configureAdminData({ dataDir: '/custom/path' });
    await ensureAdminDataFiles();
    expect(mockFs.mkdir).toHaveBeenCalledWith('/custom/path/logs', { recursive: true });
    expect(mockFs.access).toHaveBeenCalledWith('/custom/path/admin-users.json');
  });
});




describe('migrateFromLegacyUsers', () => {
  it('should return early if legacy file does not exist', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.reject(new Error('ENOENT'));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it('should return early if no users have admin properties', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'basic' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it('should migrate users with role property', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'admin1', role: 'admin' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(1);
    expect(writtenData[0].id).toBe('u1');
    expect(writtenData[0].role).toBe('admin');
  });

  it('should migrate users with permissions property', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'perm1', permissions: ['read'] },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('should migrate users with is_admin property', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'legacy_admin', is_admin: true },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
  });

  it('should skip users that already exist in admin-users.json', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'existing-1', username: 'admin1', role: 'admin' },
          { id: 'new-1', username: 'admin2', role: 'editor' },
        ]));
      }
      return Promise.resolve(JSON.stringify([
        { id: 'existing-1', username: 'admin1', role: 'admin', isActive: true },
      ]));
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(2);
    expect(writtenData.map((u: { id: string }) => u.id)).toContain('new-1');
    expect(writtenData.map((u: { id: string }) => u.id)).toContain('existing-1');
  });

  it('should transform migrated users to camelCase', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          {
            id: 'u1',
            username: 'legacy',
            password_hash: 'h',
            is_active: true,
            role: 'admin',
            created_at: '2024-01-01',
          },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].passwordHash).toBe('h');
    expect(writtenData[0].isActive).toBe(true);
    expect(writtenData[0].createdAt).toBe('2024-01-01');
  });

  it('should use getRolePermissions from config for users without permissions', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', role: 'admin' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].permissions).toEqual(['read', 'write', 'manage']);
  });

  it('should preserve existing permissions when user has them', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', role: 'admin', permissions: ['custom'] },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].permissions).toEqual(['custom']);
  });

  it('should default role to admin when legacy user has no role', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', is_admin: true },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].role).toBe('admin');
  });

  it('should use email as username fallback', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', email: 'user@test.com', role: 'admin' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].username).toBe('user@test.com');
  });

  it('should derive handle from email when handle is missing', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', email: 'user@test.com', role: 'admin' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].handle).toBe('user');
  });

  it('should not throw on migration error (optional migration)', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', role: 'admin' },
        ]));
      }
      return Promise.resolve('[]');
    });
    mockFs.writeFile.mockRejectedValue(new Error('ENOSPC'));
    
    await expect(migrateFromLegacyUsers()).resolves.toBeUndefined();
  });

  it('should handle multiple legacy users migration', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', role: 'admin' },
          { id: 'u2', username: 'b', role: 'editor' },
          { id: 'u3', username: 'c', role: 'viewer' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(3);
  });

  it('should merge legacy users with existing admin users', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'new-1', username: 'new', role: 'admin' },
        ]));
      }
      return Promise.resolve(JSON.stringify([
        { id: 'existing-1', username: 'existing', role: 'super_admin', isActive: true },
      ]));
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(2);
  });

  it('should use password from legacy user as passwordHash fallback', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', role: 'admin', password: 'plain-hash' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].passwordHash).toBe('plain-hash');
  });

  it('should handle totpSecretId resolution from legacy totp_secret field', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', role: 'admin', totp_secret: 'sec-123' },
        ]));
      }
      return Promise.resolve('[]');
    });
    await migrateFromLegacyUsers();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].totpSecretId).toBe('sec-123');
  });

  it('should return early if all legacy users already exist in admin', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve(JSON.stringify([
          { id: 'u1', username: 'a', role: 'admin' },
        ]));
      }
      return Promise.resolve(JSON.stringify([
        { id: 'u1', username: 'a', role: 'admin', isActive: true },
      ]));
    });
    await migrateFromLegacyUsers();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it('should handle legacy file with invalid JSON gracefully', async () => {
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve('not valid json');
      }
      return Promise.resolve('[]');
    });
    
    await expect(migrateFromLegacyUsers()).resolves.toBeUndefined();
  });
});




describe('ensureDefaultAdminUser', () => {
  it('should create default admin when no users exist', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(1);
    expect(writtenData[0].username).toBe('admin');
    expect(writtenData[0].role).toBe('super_admin');
  });

  it('should not create default admin when active admin exists (camelCase)', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify([
      { id: 'u1', username: 'existing', role: 'admin', isActive: true },
    ]));
    await ensureDefaultAdminUser();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it('should not create default admin when active admin exists (snake_case)', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify([
      { id: 'u1', username: 'existing', role: 'admin', is_active: true },
    ]));
    await ensureDefaultAdminUser();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });

  it('should create default admin when only inactive users exist', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify([
      { id: 'u1', username: 'inactive', role: 'admin', isActive: false },
    ]));
    await ensureDefaultAdminUser();
    expect(mockFs.writeFile).toHaveBeenCalledTimes(1);
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(2);
  });

  it('should set correct default admin id', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should set correct default admin email', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].email).toBe('admin@example.com');
  });

  it('should set correct default admin handle', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].handle).toBe('admin');
  });

  it('should set correct default admin password hash', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].passwordHash).toBe(
      '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJgccpkRJLYczBMvIW'
    );
  });

  it('should set totpSecretId to null for default admin', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].totpSecretId).toBeNull();
  });

  it('should set totpEnabled to false for default admin', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].totpEnabled).toBe(false);
  });

  it('should set isActive to true for default admin', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].isActive).toBe(true);
  });

  it('should set certificateCn to null for default admin', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].certificateCn).toBeNull();
  });

  it('should use getRolePermissions for super_admin from config', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].permissions).toEqual(['all']);
  });

  it('should set createdAt and updatedAt as ISO timestamps', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    const before = new Date().toISOString();
    await ensureDefaultAdminUser();
    const after = new Date().toISOString();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].createdAt >= before).toBe(true);
    expect(writtenData[0].createdAt <= after).toBe(true);
    expect(writtenData[0].updatedAt >= before).toBe(true);
    expect(writtenData[0].updatedAt <= after).toBe(true);
  });

  it('should set lastLoginAt to null for default admin', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData[0].lastLoginAt).toBeNull();
  });

  it('should throw when readFile fails', async () => {
    mockFs.readFile.mockRejectedValue(new Error('EACCES'));
    await expect(ensureDefaultAdminUser()).rejects.toThrow('EACCES');
  });

  it('should throw when writeFile fails', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    mockFs.writeFile.mockRejectedValue(new Error('ENOSPC'));
    await expect(ensureDefaultAdminUser()).rejects.toThrow('ENOSPC');
  });

  it('should append default admin to existing inactive users', async () => {
    mockFs.readFile.mockResolvedValue(JSON.stringify([
      { id: 'u1', username: 'old', role: 'admin', isActive: false },
      { id: 'u2', username: 'old2', role: 'editor', isActive: false },
    ]));
    await ensureDefaultAdminUser();
    const writtenData = JSON.parse(mockFs.writeFile.mock.calls[0][1]);
    expect(writtenData).toHaveLength(3);
    expect(writtenData[2].username).toBe('admin');
  });

  it('should write to the correct file path', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      '/test/data/admin-users.json',
      expect.any(String),
      'utf8'
    );
  });

  it('should write JSON with 2-space indentation', async () => {
    mockFs.readFile.mockResolvedValue('[]');
    await ensureDefaultAdminUser();
    const written = mockFs.writeFile.mock.calls[0][1];
    
    expect(written).toContain('\n  ');
    expect(JSON.parse(written)).toBeDefined();
  });
});




describe('runAdminDataMigration', () => {
  it('should run all three migration steps', async () => {
    
    mockFs.access.mockRejectedValue(new Error('ENOENT'));
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.reject(new Error('ENOENT'));
      }
      
      return Promise.resolve('[]');
    });

    await runAdminDataMigration();

    
    expect(mockFs.mkdir).toHaveBeenCalled();
    
    expect(mockFs.writeFile).toHaveBeenCalled();
  });

  it('should run ensureAdminDataFiles first', async () => {
    const callOrder: string[] = [];
    mockFs.mkdir.mockImplementation(() => {
      callOrder.push('mkdir');
      return Promise.resolve(undefined);
    });
    mockFs.access.mockResolvedValue(undefined);
    mockFs.readFile.mockImplementation((filePath: string) => {
      callOrder.push(`readFile:${filePath.split('/').pop()}`);
      if (filePath.includes('users.json') && !filePath.includes('admin')) {
        return Promise.reject(new Error('ENOENT'));
      }
      return Promise.resolve(JSON.stringify([
        { id: 'u1', username: 'active', role: 'admin', isActive: true },
      ]));
    });

    await runAdminDataMigration();
    expect(callOrder[0]).toBe('mkdir');
  });

  it('should handle error in migrateFromLegacyUsers without blocking ensureDefaultAdminUser', async () => {
    mockFs.access.mockResolvedValue(undefined);
    let ensureDefaultCalled = false;
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.resolve('invalid json that will throw');
      }
      if (filePath === '/test/data/admin-users.json') {
        if (ensureDefaultCalled) {
          return Promise.resolve('[]');
        }
        ensureDefaultCalled = true;
        return Promise.resolve('[]');
      }
      return Promise.resolve('[]');
    });

    
    await expect(runAdminDataMigration()).resolves.toBeUndefined();
  });

  it('should propagate error from ensureAdminDataFiles', async () => {
    mockFs.mkdir.mockRejectedValue(new Error('FATAL'));
    await expect(runAdminDataMigration()).rejects.toThrow('FATAL');
  });

  it('should propagate error from ensureDefaultAdminUser', async () => {
    mockFs.access.mockResolvedValue(undefined);
    mockFs.readFile.mockImplementation((filePath: string) => {
      if (filePath === '/test/data/users.json') {
        return Promise.reject(new Error('ENOENT'));
      }
      
      return Promise.reject(new Error('EACCES'));
    });
    await expect(runAdminDataMigration()).rejects.toThrow('EACCES');
  });
});
