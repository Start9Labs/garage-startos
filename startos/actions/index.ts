import { sdk } from '../sdk'
import { createBucket } from './buckets/create'
import { deleteBucket } from './buckets/delete'
import { listBuckets } from './buckets/list'
import { resetAdminToken } from './resetAdminToken'
import { createApiKey } from './keys/create'
import { deleteApiKey } from './keys/delete'
import { grantBucketToKey } from './keys/grantBucketToKey'
import { listApiKeys } from './keys/list'
import { clusterStatus } from './status'

export const actions = sdk.Actions.of()
  .addAction(resetAdminToken)
  .addAction(clusterStatus)
  .addAction(createBucket)
  .addAction(createApiKey)
  .addAction(listBuckets)
  .addAction(listApiKeys)
  .addAction(deleteApiKey)
  .addAction(deleteBucket)
  .addAction(grantBucketToKey)
