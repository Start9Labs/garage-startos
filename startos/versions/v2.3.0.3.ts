import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const v_2_3_0_3 = VersionInfo.of({
  version: '2.3.0:3',
  releaseNotes: {
    en_US: 'Internal updates (start-sdk 1.5.2)',
    es_ES: 'Actualizaciones internas (start-sdk 1.5.2)',
    de_DE: 'Interne Aktualisierungen (start-sdk 1.5.2)',
    pl_PL: 'Aktualizacje wewnętrzne (start-sdk 1.5.2)',
    fr_FR: 'Mises à jour internes (start-sdk 1.5.2)',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
