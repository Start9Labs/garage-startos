import { writeFile } from 'node:fs/promises'
import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { getAdminToken } from '../actions/getAdminToken'
import { s3ApiPort, rpcPort, s3WebPort, adminPort } from '../utils'
import { generateGarageToml } from '../garageConfig'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const rpcSecret = utils.getDefaultString({
    charset: 'a-f,0-9',
    len: 64,
  })

  const adminToken = utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 32,
  })

  await storeJson.write(effects, {
    rpcSecret,
    adminToken,
  })

  const garageSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'garage' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'garage-init-sub',
  )

  await writeFile(
    `${garageSub.rootfs}/etc/garage.toml`,
    generateGarageToml({ rpcSecret, adminToken }),
  )

  await sdk.Daemons.of(effects)
    .addDaemon('garage', {
      subcontainer: garageSub,
      exec: {
        command: ['/garage', 'server'],
        env: { GARAGE_CONFIG_FILE: '/etc/garage.toml' },
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, s3ApiPort, {
            successMessage: 'Garage is ready',
            errorMessage: 'Garage is not ready',
          }),
      },
      requires: [],
    })
    .addOneshot('configure-layout', {
      subcontainer: garageSub,
      exec: {
        command: [
          '/bin/sh',
          '-c',
          `export GARAGE_CONFIG_FILE=/etc/garage.toml
NODE_ID=$(/garage node id 2>&1 | cut -d@ -f1 | head -n1)
/garage layout assign -z dc1 -c 1G "$NODE_ID"
LAYOUT_VER=$(/garage layout show 2>&1 | grep 'apply --version' | awk '{print $NF}')
/garage layout apply --version "$LAYOUT_VER"`,
        ],
        env: { GARAGE_CONFIG_FILE: '/etc/garage.toml' },
      },
      requires: ['garage'],
    })
    .runUntilSuccess(120_000)

  await sdk.action.createOwnTask(effects, getAdminToken, 'critical', {
    reason: i18n('Retrieve the admin API token'),
  })
})
