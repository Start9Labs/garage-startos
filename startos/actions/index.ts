import { sdk } from '../sdk'
import { getAdminToken } from './getAdminToken'
import { createBucket } from './createBucket'
import { createApiKey } from './createApiKey'
import { listBuckets } from './listBuckets'
import { listApiKeys } from './listApiKeys'

export const actions = sdk.Actions.of()
  .addAction(getAdminToken)
  .addAction(createBucket)
  .addAction(createApiKey)
  .addAction(listBuckets)
  .addAction(listApiKeys)
