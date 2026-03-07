import { writeFile } from 'node:fs/promises'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { s3ApiPort, adminPort } from './utils'
import { generateGarageToml } from './garageConfig'

export const main = sdk.setupMain(async ({ effects }) => {
  const store = await storeJson.read().const(effects)

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
    .addHealthCheck('cluster-status', {
      ready: {
        display: i18n('Cluster Status'),
        fn: async () => {
          try {
            const result = await garageSub.exec(['/garage', 'status'], {
              env: { GARAGE_CONFIG_FILE: '/etc/garage.toml' },
            })
            if (result.exitCode !== 0) {
              return {
                result: 'failure' as const,
                message: 'Garage cluster is not responding',
              }
            }
            const output = String(result.stdout || '')
            const healthySection =
              output.split(/====\s*HEALTHY NODES\s*====/)[1] || ''
            const nodeLines = healthySection
              .split('\n')
              .filter((l) => l.trim().length > 0 && !l.trim().startsWith('ID'))
              .filter((l) => /^[0-9a-f]+/.test(l.trim()))
            if (nodeLines.length > 0) {
              return {
                result: 'success' as const,
                message: `${nodeLines.length} healthy node(s)`,
              }
            } else {
              return {
                result: 'failure' as const,
                message: 'No healthy nodes in cluster',
              }
            }
          } catch {
            return {
              result: 'failure' as const,
              message: 'Could not connect to Garage daemon',
            }
          }
        },
      },
      requires: ['garage'],
    })
})
