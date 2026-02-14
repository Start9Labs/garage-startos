import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { getAdminToken } from '../actions/getAdminToken'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const rpcSecret = utils.getDefaultString({
    charset: 'a-f,0-9',
    len: 64,
  })

  const adminToken = utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 32,
  })

  await storeJson.write(effects, {
    rpcSecret,
    adminToken,
  })

  await sdk.action.createOwnTask(effects, getAdminToken, 'critical', {
    reason: i18n('Retrieve the admin API token'),
  })
})
