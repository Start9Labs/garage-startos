import { setupManifest } from '@start9labs/start-sdk'
import { short, long, alertInstall } from './i18n'

export const manifest = setupManifest({
  id: 'garage',
  title: 'Garage',
  license: 'AGPL-3.0',
  wrapperRepo: 'https://github.com/Start9Labs/garage-startos',
  upstreamRepo: 'https://git.deuxfleurs.fr/Deuxfleurs/garage',
  supportSite: 'https://garagehq.deuxfleurs.fr/',
  marketingSite: 'https://garagehq.deuxfleurs.fr/',
  donationUrl: null,
  docsUrl: 'https://garagehq.deuxfleurs.fr/documentation/quick-start/',
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
    install: alertInstall,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
