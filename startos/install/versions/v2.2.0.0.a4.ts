import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_2_0_0_a4 = VersionInfo.of({
  version: '2.2.0:0-alpha.4',
  releaseNotes:
    'Added dynamic dropdowns for delete and grant actions. Multi-select support for batch deletion of keys and buckets. Grant actions now properly revoke unchecked permissions. Added Admin API health check.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
