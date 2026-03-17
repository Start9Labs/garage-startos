import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  garageEnv,
  garageHealthUrl,
  garageImageId,
  garageMounts,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const garageSub = await sdk.SubContainer.of(
    effects,
    garageImageId,
    garageMounts,
    'garage-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('garage', {
    subcontainer: garageSub,
    exec: {
      command: ['/garage', 'server'],
      env: garageEnv,
    },
    ready: {
      display: i18n('Garage'),
      fn: () =>
        sdk.healthCheck.checkWebUrl(effects, garageHealthUrl, {
          successMessage: i18n('Garage is healthy'),
          errorMessage: i18n('Garage is not healthy'),
        }),
    },
    requires: [],
  })
})
