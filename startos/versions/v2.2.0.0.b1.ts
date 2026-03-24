import { VersionInfo } from '@start9labs/start-sdk'

export const v_2_2_0_0_b1 = VersionInfo.of({
  version: '2.2.0:0-beta.1',
  releaseNotes: {
    en_US: 'Downgrade Garage to upstream version 2.2.0',
    es_ES: 'Downgrade de Garage a la versión upstream 2.2.0',
    de_DE: 'Downgrade von Garage auf Upstream-Version 2.2.0',
    pl_PL: 'Downgrade Garage do wersji upstream 2.2.0',
    fr_FR: 'Downgrade de Garage vers la version upstream 2.2.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
