import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_2_0_1_b1 = VersionInfo.of({
  version: '2.2.0:1-beta.1',
  releaseNotes:
    'Added restore-from-backup alert warning that S3 API and Admin API ports may have changed.',
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
