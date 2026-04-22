import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_3_0_0 = VersionInfo.of({
  version: '2.3.0:0',
  releaseNotes: {
    en_US: 'Update Garage to upstream version 2.3.0',
    es_ES: 'Actualización de Garage a la versión upstream 2.3.0',
    de_DE: 'Update von Garage auf Upstream-Version 2.3.0',
    pl_PL: 'Aktualizacja Garage do wersji upstream 2.3.0',
    fr_FR: 'Mise à jour de Garage vers la version upstream 2.3.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
