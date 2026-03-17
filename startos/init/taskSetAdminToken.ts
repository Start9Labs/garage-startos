import { resetAdminToken } from '../actions/resetAdminToken'
import { garageToml } from '../fileModels/garage.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSetAdminToken = sdk.setupOnInit(async (effects) => {
  if (!(await garageToml.read((c) => c.admin.admin_token).const(effects))) {
    await sdk.action.createOwnTask(effects, resetAdminToken, 'critical', {
      reason: i18n('Set your admin API token'),
    })
  }
})
