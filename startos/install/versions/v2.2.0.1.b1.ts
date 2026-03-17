import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_2_0_1_b1 = VersionInfo.of({
  version: '2.2.0:1-beta.1',
  releaseNotes: {
    en_US: 'Initial release for StartOS 0.40',
    es_ES: 'Versión inicial para StartOS 0.40',
    de_DE: 'Erstveröffentlichung für StartOS 0.40',
    pl_PL: 'Pierwsze wydanie dla StartOS 0.40',
    fr_FR: 'Version initiale pour StartOS 0.40',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
