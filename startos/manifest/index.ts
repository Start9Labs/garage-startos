import { setupManifest } from '@start9labs/start-sdk'
import { short, long, alertInstall, alertRestore } from './i18n'

export const manifest = setupManifest({
  id: 'garage',
  title: 'Garage',
  license: 'AGPL-3.0',
  packageRepo: 'https://github.com/jessemarkowitz/garage-startos',
  upstreamRepo: 'https://git.deuxfleurs.fr/Deuxfleurs/garage',
  marketingUrl: 'https://garagehq.deuxfleurs.fr/',
  donationUrl: null,
  docsUrls: ['https://github.com/JesseMarkowitz/garage-startos/blob/main/instructions.md'],
  description: { short, long },
  volumes: ['main'],
  images: {
    garage: {
      source: {
        dockerBuild: {},
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: alertInstall,
    update: null,
    uninstall: null,
    restore: alertRestore,
    start: null,
    stop: null,
  },
  dependencies: {},
})
