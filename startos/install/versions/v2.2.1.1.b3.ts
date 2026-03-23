import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_2_1_1_b3 = VersionInfo.of({
  version: '2.2.1:1-beta.3',
  releaseNotes: {
    en_US: 'Update Garage to upstream version 2.2.1',
    es_ES: 'Actualización de Garage a la versión upstream 2.2.1',
    de_DE: 'Aktualisierung von Garage auf Upstream-Version 2.2.1',
    pl_PL: 'Aktualizacja Garage do wersji upstream 2.2.1',
    fr_FR: 'Mise à jour de Garage vers la version upstream 2.2.1',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
