import { setupManifest } from '@start9labs/start-sdk'
import { alertRestore, alertUninstall, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'garage',
  title: 'Garage',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/garage-startos/tree/update/040',
  upstreamRepo: 'https://git.deuxfleurs.fr/Deuxfleurs/garage',
  marketingUrl: 'https://garagehq.deuxfleurs.fr/',
  donationUrl: null,
  docsUrls: [
    'https://git.deuxfleurs.fr/Deuxfleurs/garage/src/branch/main-v2/doc/book',
  ],
  description: { short, long },
  volumes: ['main'],
  images: {
    garage: {
      source: {
        dockerTag: 'dxflrs/garage:v2.2.0',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: alertUninstall,
    restore: alertRestore,
    start: null,
    stop: null,
  },
  dependencies: {},
})
