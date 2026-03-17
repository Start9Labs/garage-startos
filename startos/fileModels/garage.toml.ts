import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { s3ApiPort, rpcPort, s3WebPort, adminPort } from '../utils'

const s3ApiSchema = z.object({
  api_bind_addr: z
    .literal(`0.0.0.0:${s3ApiPort}`)
    .catch(`0.0.0.0:${s3ApiPort}`),
  s3_region: z.literal('garage').catch('garage'),
  root_domain: z.literal('.s3.garage').catch('.s3.garage'),
})

const s3WebSchema = z.object({
  bind_addr: z
    .literal(`0.0.0.0:${s3WebPort}`)
    .catch(`0.0.0.0:${s3WebPort}`),
  root_domain: z.literal('.web.garage').catch('.web.garage'),
})

const adminSchema = z.object({
  api_bind_addr: z
    .literal(`0.0.0.0:${adminPort}`)
    .catch(`0.0.0.0:${adminPort}`),
  admin_token: z.string().catch(''),
})

export const shape = z.object({
  // enforced
  metadata_dir: z.literal('/data/metadata').catch('/data/metadata'),
  data_dir: z.literal('/data/blocks').catch('/data/blocks'),
  db_engine: z.literal('lmdb').catch('lmdb'),
  replication_factor: z.literal(1).catch(1),
  consistency_mode: z.literal('consistent').catch('consistent'),
  rpc_bind_addr: z
    .literal(`0.0.0.0:${rpcPort}`)
    .catch(`0.0.0.0:${rpcPort}`),
  s3_api: s3ApiSchema.catch(() => s3ApiSchema.parse({})),
  s3_web: s3WebSchema.catch(() => s3WebSchema.parse({})),

  // configurable
  compression_level: z.number().int().catch(1),
  rpc_secret: z.string().catch(''),
  admin: adminSchema.catch(() => adminSchema.parse({})),
})

export const garageToml = FileHelper.toml(
  { base: sdk.volumes.main, subpath: 'garage.toml' },
  shape,
)
