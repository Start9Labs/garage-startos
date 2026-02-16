import { writeFile } from 'node:fs/promises'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { s3ApiPort, adminPort } from './utils'
import { generateGarageToml } from './garageConfig'

export const main = sdk.setupMain(async ({ effects }) => {
  const store = await storeJson.read((s) => s).const(effects)

  const rpcSecret = store?.rpcSecret ?? ''
  const adminToken = store?.adminToken ?? ''

  const garageSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'garage' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'garage-sub',
  )

  await writeFile(
    `${garageSub.rootfs}/etc/garage.toml`,
    generateGarageToml({ rpcSecret, adminToken }),
  )

  return sdk.Daemons.of(effects)
    .addDaemon('garage', {
      subcontainer: garageSub,
      exec: {
        command: ['/garage', 'server'],
        env: {
          GARAGE_CONFIG_FILE: '/etc/garage.toml',
        },
      },
      ready: {
        display: i18n('S3 API'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, s3ApiPort, {
            successMessage: i18n('The S3 API is ready'),
            errorMessage: i18n('The S3 API is not ready'),
          }),
      },
      requires: [],
    })
    .addHealthCheck('admin-api', {
      ready: {
        display: i18n('Admin API'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, adminPort, {
            successMessage: i18n('The Admin API is ready'),
            errorMessage: i18n('The Admin API is not ready'),
          }),
      },
      requires: ['garage'],
    })
})
