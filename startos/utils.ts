import { utils } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const s3ApiPort = 3900
export const rpcPort = 3901
export const s3WebPort = 3902
export const adminPort = 3903

export const randomToken = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 })

export const garageEnv = { GARAGE_CONFIG_FILE: '/data/garage.toml' }
export const garageHealthUrl = `http://127.0.0.1:${adminPort}/health`

export const garageImageId = { imageId: 'garage' } as const

export const garageMounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/data',
    readonly: false,
  })
  .mountVolume({
    volumeId: 'main',
    subpath: 'passwd',
    mountpoint: '/etc/passwd',
    readonly: true,
    type: 'file',
  })
  .mountVolume({
    volumeId: 'main',
    subpath: 'group',
    mountpoint: '/etc/group',
    readonly: true,
    type: 'file',
  })
