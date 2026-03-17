import { sdk } from '../sdk'
import { getAdminToken } from './getAdminToken'
import { createBucket } from './buckets/create'
import { deleteBucket } from './buckets/delete'
import { listBuckets } from './buckets/list'
import { createApiKey } from './keys/create'
import { deleteApiKey } from './keys/delete'
import { listApiKeys } from './keys/list'
import { grantKeyToBucket } from './permissions/grantKeyToBucket'
import { grantBucketToKey } from './permissions/grantBucketToKey'
import { clusterStatus } from './cluster/status'

export const actions = sdk.Actions.of()
  .addAction(getAdminToken)
  .addAction(clusterStatus)
  .addAction(createBucket)
  .addAction(createApiKey)
  .addAction(listBuckets)
  .addAction(listApiKeys)
  .addAction(deleteApiKey)
  .addAction(deleteBucket)
  .addAction(grantKeyToBucket)
  .addAction(grantBucketToKey)
