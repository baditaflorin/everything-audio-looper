import { z } from 'zod';

export const repositoryUrl = __REPOSITORY_URL__;
export const paypalUrl = __PAYPAL_URL__;

export const versionManifestSchema = z.object({
  schemaVersion: z.literal(1),
  version: z.string().min(1),
  commit: z.string().min(1),
  builtAt: z.string().min(1),
  repositoryUrl: z.string().url(),
  paypalUrl: z.string().url()
});

export type VersionManifest = z.infer<typeof versionManifestSchema>;

export const buildVersion: VersionManifest = {
  schemaVersion: 1,
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
  builtAt: __BUILT_AT__,
  repositoryUrl,
  paypalUrl
};

export async function fetchVersionManifest(baseUrl = import.meta.env.BASE_URL) {
  const response = await fetch(`${baseUrl}version.json`, { cache: 'no-store' });
  if (!response.ok) {
    return buildVersion;
  }

  const json: unknown = await response.json();
  return versionManifestSchema.parse(json);
}
