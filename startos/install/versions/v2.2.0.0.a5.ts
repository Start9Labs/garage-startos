import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_2_0_0_a5 = VersionInfo.of({
  version: '2.2.0:0-alpha.5',
  releaseNotes:
    'Updated to SDK 0.4.0-beta.58. Migrated file models to zod schema validation. Adopted execFail for cleaner error handling. Consolidated subcontainer setup across all actions.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
