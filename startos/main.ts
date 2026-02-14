import { writeFile } from 'node:fs/promises'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { s3ApiPort, rpcPort, s3WebPort, adminPort } from './utils'

function generateGarageToml(config: {
  rpcSecret: string
  adminToken: string
  metadataDir: string
  dataDir: string
}): string {
  return `
metadata_dir = "${config.metadataDir}"
data_dir = "${config.dataDir}"
db_engine = "lmdb"

replication_factor = 1
consistency_mode = "consistent"

compression_level = 1

[rpc]
bind_addr = "0.0.0.0:${rpcPort}"
rpc_secret = "${config.rpcSecret}"

[s3_api]
api_bind_addr = "0.0.0.0:${s3ApiPort}"
s3_region = "garage"
root_domain = ".s3.garage"

[s3_web]
bind_addr = "0.0.0.0:${s3WebPort}"
root_domain = ".web.garage"

[admin]
api_bind_addr = "0.0.0.0:${adminPort}"
admin_token = "${config.adminToken}"
`
}

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
    generateGarageToml({
      rpcSecret,
      adminToken,
      metadataDir: '/data/metadata',
      dataDir: '/data/blocks',
    }),
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
    .addOneshot('configure-layout', {
      subcontainer: garageSub,
      exec: {
        command: [
          '/bin/sh',
          '-c',
          `set -e
GARAGE_CONFIG_FILE=/etc/garage.toml
export GARAGE_CONFIG_FILE
NODE_ID=$(/garage status 2>/dev/null | grep 'this node' | awk '{print $1}' || true)
if [ -z "$NODE_ID" ]; then
  NODE_ID=$(/garage node id 2>/dev/null | cut -d@ -f1 || true)
fi
if [ -z "$NODE_ID" ]; then
  echo "Could not determine node ID"
  exit 1
fi
LAYOUT=$(/garage layout show 2>&1 || true)
if echo "$LAYOUT" | grep -q "$NODE_ID"; then
  echo "Node already in layout, skipping assignment"
else
  /garage layout assign -z dc1 -c 1G "$NODE_ID"
  LAYOUT_VER=$(/garage layout show 2>&1 | grep 'apply --version' | awk '{print $NF}' || echo "1")
  /garage layout apply --version "$LAYOUT_VER"
fi
echo "Layout configured successfully"`,
        ],
        env: {
          GARAGE_CONFIG_FILE: '/etc/garage.toml',
        },
      },
      requires: ['garage'],
    })
})
