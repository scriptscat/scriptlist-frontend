import { describe, expect, it } from 'vitest';
import { canViewDeletedScripts } from './script-status-policy';

describe('canViewDeletedScripts', () => {
  it('allows the profile owner and administrators', () => {
    expect(canViewDeletedScripts(42, { user_id: 42, is_admin: 0 })).toBe(true);
    expect(canViewDeletedScripts(42, { user_id: 7, is_admin: 1 })).toBe(true);
  });

  it('hides deleted scripts from visitors and signed-out users', () => {
    expect(canViewDeletedScripts(42, { user_id: 7, is_admin: 0 })).toBe(false);
    expect(canViewDeletedScripts(42, null)).toBe(false);
  });
});
