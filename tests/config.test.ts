import { describe, it, expect, beforeEach } from 'vitest';
import {
  configureAdminData,
  getAdminDataConfig,
  resetAdminDataConfig,
  getLogger,
} from '../src/config.js';
import type { AdminDataConfig, AdminDataLogger } from '../src/config.js';

beforeEach(() => {
  resetAdminDataConfig();
});

// ===========================================================================
// configureAdminData
// ===========================================================================
describe('configureAdminData', () => {
  it('should merge dataDir into config', () => {
    configureAdminData({ dataDir: '/custom/dir' });
    expect(getAdminDataConfig().dataDir).toBe('/custom/dir');
  });

  it('should merge getRolePermissions into config', () => {
    const fn = (role: string) => [role];
    configureAdminData({ getRolePermissions: fn });
    expect(getAdminDataConfig().getRolePermissions('admin')).toEqual(['admin']);
  });

  it('should merge getLogger into config', () => {
    const mockLogger: AdminDataLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };
    configureAdminData({ getLogger: () => mockLogger });
    expect(getAdminDataConfig().getLogger()).toBe(mockLogger);
  });

  it('should merge partial config without overwriting other fields', () => {
    configureAdminData({ dataDir: '/first' });
    configureAdminData({ getRolePermissions: () => ['x'] });
    const cfg = getAdminDataConfig();
    expect(cfg.dataDir).toBe('/first');
    expect(cfg.getRolePermissions('any')).toEqual(['x']);
  });

  it('should allow overwriting a previously set value', () => {
    configureAdminData({ dataDir: '/first' });
    configureAdminData({ dataDir: '/second' });
    expect(getAdminDataConfig().dataDir).toBe('/second');
  });

  it('should accept empty config without error', () => {
    expect(() => configureAdminData({})).not.toThrow();
  });
});

// ===========================================================================
// getAdminDataConfig
// ===========================================================================
describe('getAdminDataConfig', () => {
  it('should return default dataDir when unconfigured', () => {
    const cfg = getAdminDataConfig();
    expect(cfg.dataDir).toContain('/content/auth');
  });

  it('should return default getRolePermissions returning ["read"] when unconfigured', () => {
    const cfg = getAdminDataConfig();
    expect(cfg.getRolePermissions('anything')).toEqual(['read']);
  });

  it('should return default getLogger returning a logger when unconfigured', () => {
    const cfg = getAdminDataConfig();
    const logger = cfg.getLogger();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should return custom dataDir after configuration', () => {
    configureAdminData({ dataDir: '/my/path' });
    expect(getAdminDataConfig().dataDir).toBe('/my/path');
  });

  it('should return custom getRolePermissions after configuration', () => {
    configureAdminData({ getRolePermissions: () => ['admin', 'write'] });
    expect(getAdminDataConfig().getRolePermissions('x')).toEqual(['admin', 'write']);
  });

  it('should return custom getLogger after configuration', () => {
    const mockLogger: AdminDataLogger = { info: () => {}, warn: () => {}, error: () => {} };
    configureAdminData({ getLogger: () => mockLogger });
    expect(getAdminDataConfig().getLogger()).toBe(mockLogger);
  });

  it('should return a Required<AdminDataConfig> with all fields defined', () => {
    const cfg = getAdminDataConfig();
    expect(cfg.dataDir).toBeDefined();
    expect(cfg.getRolePermissions).toBeDefined();
    expect(cfg.getLogger).toBeDefined();
  });
});

// ===========================================================================
// resetAdminDataConfig
// ===========================================================================
describe('resetAdminDataConfig', () => {
  it('should reset dataDir to default', () => {
    configureAdminData({ dataDir: '/custom' });
    resetAdminDataConfig();
    expect(getAdminDataConfig().dataDir).toContain('/content/auth');
  });

  it('should reset getRolePermissions to default', () => {
    configureAdminData({ getRolePermissions: () => ['all'] });
    resetAdminDataConfig();
    expect(getAdminDataConfig().getRolePermissions('x')).toEqual(['read']);
  });

  it('should reset getLogger to default', () => {
    const custom: AdminDataLogger = { info: () => {}, warn: () => {}, error: () => {} };
    configureAdminData({ getLogger: () => custom });
    resetAdminDataConfig();
    // Default logger should be console-based, not our custom one
    expect(getAdminDataConfig().getLogger()).not.toBe(custom);
  });

  it('should be idempotent', () => {
    resetAdminDataConfig();
    resetAdminDataConfig();
    expect(getAdminDataConfig().dataDir).toContain('/content/auth');
  });
});

// ===========================================================================
// getLogger
// ===========================================================================
describe('getLogger', () => {
  it('should return default logger when unconfigured', () => {
    const logger = getLogger();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should return custom logger after configuration', () => {
    const custom: AdminDataLogger = { info: () => {}, warn: () => {}, error: () => {} };
    configureAdminData({ getLogger: () => custom });
    expect(getLogger()).toBe(custom);
  });

  it('should return default logger after reset', () => {
    const custom: AdminDataLogger = { info: () => {}, warn: () => {}, error: () => {} };
    configureAdminData({ getLogger: () => custom });
    resetAdminDataConfig();
    expect(getLogger()).not.toBe(custom);
  });
});
