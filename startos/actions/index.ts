import { sdk } from '../sdk'
import { getAdminToken } from './getAdminToken'
import { createBucket } from './createBucket'
import { createApiKey } from './createApiKey'
import { listBuckets } from './listBuckets'
import { listApiKeys } from './listApiKeys'
import { deleteApiKey } from './deleteApiKey'
import { deleteBucket } from './deleteBucket'
import { grantKeyToBucket } from './grantKeyToBucket'
import { grantBucketToKey } from './grantBucketToKey'
import { clusterStatus } from './clusterStatus'

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
