import { utils } from '@start9labs/start-sdk'
import { garageToml } from '../fileModels/garage.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const resetAdminToken = sdk.Action.withoutInput(
  'reset-admin-token',

  async ({ effects }) => {
    const token = await garageToml
      .read((c) => c.admin.admin_token)
      .const(effects)

    return {
      name: token ? i18n('Reset Admin Token') : i18n('Set Admin Token'),
      description: i18n('Generate a new admin API token for Garage'),
      warning: token
        ? i18n(
            'This will invalidate the current admin token. Save the new token to a password manager.',
          )
        : null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const admin_token = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })

    await garageToml.merge(effects, { admin: { admin_token } })

    return {
      version: '1' as const,
      title: i18n('Admin Token Set'),
      message: i18n(
        'Save this token to a password manager. It will not be shown again.',
      ),
      result: {
        type: 'single',
        name: i18n('Admin Token'),
        description: null,
        value: admin_token,
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
