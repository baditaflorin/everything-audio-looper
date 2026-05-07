import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildVersion, fetchVersionManifest, versionManifestSchema } from './version';

describe('version manifest', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('matches the public static schema', () => {
    expect(versionManifestSchema.parse(buildVersion)).toEqual(buildVersion);
  });

  it('falls back to build metadata when version.json is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false
      })
    );

    await expect(fetchVersionManifest('/')).resolves.toEqual(buildVersion);
  });

  it('parses version.json when the static manifest is available', async () => {
    const manifest = {
      ...buildVersion,
      commit: 'abc1234'
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(manifest)
      })
    );

    await expect(fetchVersionManifest('/')).resolves.toEqual(manifest);
  });
});
