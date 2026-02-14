import { i18n } from './i18n'
import { sdk } from './sdk'
import { s3ApiPort, adminPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const s3Multi = sdk.MultiHost.of(effects, 's3-multi')
  const s3MultiOrigin = await s3Multi.bindPort(s3ApiPort, {
    protocol: 'http',
  })

  const s3Api = sdk.createInterface(effects, {
    name: i18n('S3 API Interface'),
    id: 's3',
    description: i18n('S3-compatible object storage API'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const s3Receipt = await s3MultiOrigin.export([s3Api])

  const adminMulti = sdk.MultiHost.of(effects, 'admin-multi')
  const adminMultiOrigin = await adminMulti.bindPort(adminPort, {
    protocol: 'http',
  })

  const adminApi = sdk.createInterface(effects, {
    name: i18n('Admin API'),
    id: 'admin',
    description: i18n('Garage administration API'),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const adminReceipt = await adminMultiOrigin.export([adminApi])

  return [s3Receipt, adminReceipt]
})
