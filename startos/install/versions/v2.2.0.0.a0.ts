import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v_2_2_0_0_a0 = VersionInfo.of({
  version: '2.2.0:0-alpha.0',
  releaseNotes: 'Initial release for StartOS',
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
