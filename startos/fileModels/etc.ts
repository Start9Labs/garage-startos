import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const passwdFile = FileHelper.string(
  { base: sdk.volumes.main, subpath: 'passwd' },
  z.string(),
)

export const groupFile = FileHelper.string(
  { base: sdk.volumes.main, subpath: 'group' },
  z.string(),
)
