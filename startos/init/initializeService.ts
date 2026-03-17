import { utils } from '@start9labs/start-sdk'
import { garageToml } from '../fileModels/garage.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { groupFile, passwdFile } from '../fileModels/etc'
import {
  garageEnv,
  garageHealthUrl,
  garageImageId,
  garageMounts,
} from '../utils'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await passwdFile.write(effects, 'root:x:0:0:root:/root:/bin/sh\n')
  await groupFile.write(effects, 'root:x:0:\n')

  await garageToml.merge(effects, {
    rpc_secret: utils.getDefaultString({
      charset: 'a-f,0-9',
      len: 64,
    }),
  })

  const garageSub = await sdk.SubContainer.of(
    effects,
    garageImageId,
    garageMounts,
    'garage-init-sub',
  )

  await sdk.Daemons.of(effects)
    .addDaemon('garage', {
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
    .addOneshot('bootstrap-layout', {
      subcontainer: garageSub,
      exec: {
        fn: async () => {
          // Get node ID
          const idRes = await garageSub.execFail(
            ['/garage', 'node', 'id'],
            { env: garageEnv },
          )
          const nodeId = String(idRes.stdout)
            .split('@')[0]
            .split('\n')[0]
            .trim()

          // Assign layout
          await garageSub.execFail(
            ['/garage', 'layout', 'assign', '-z', 'dc1', '-c', '1G', nodeId],
            { env: garageEnv },
          )

          // Get layout version
          const showRes = await garageSub.execFail(
            ['/garage', 'layout', 'show'],
            { env: garageEnv },
          )
          const versionMatch = String(showRes.stdout).match(
            /apply --version (\d+)/,
          )
          if (!versionMatch) {
            throw new Error(
              `Could not parse layout version from: ${showRes.stdout}`,
            )
          }

          // Apply layout
          await garageSub.execFail(
            ['/garage', 'layout', 'apply', '--version', versionMatch[1]],
            { env: garageEnv },
          )

          return null
        },
      },
      requires: ['garage'],
    })
    .runUntilSuccess(120_000)
})
