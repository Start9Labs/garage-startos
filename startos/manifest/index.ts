import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'garage',
  title: 'Garage',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/garage-startos',
  upstreamRepo: 'https://git.deuxfleurs.fr/Deuxfleurs/garage',
  marketingUrl: 'https://garagehq.deuxfleurs.fr/',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    garage: {
      source: {
        dockerTag: 'dxflrs/garage:v2.3.0',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
