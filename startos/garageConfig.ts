import { s3ApiPort, rpcPort, s3WebPort, adminPort } from './utils'

export function generateGarageToml(config: {
  rpcSecret: string
  adminToken: string
}): string {
  return `metadata_dir = "/data/metadata"
data_dir = "/data/blocks"
db_engine = "lmdb"

replication_factor = 1
consistency_mode = "consistent"

compression_level = 1

rpc_bind_addr = "0.0.0.0:${rpcPort}"
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
