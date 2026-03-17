import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { garageToml } from '../fileModels/garage.toml'

export const getAdminToken = sdk.Action.withoutInput(
  'get-admin-token',

  async ({ effects }) => ({
    name: i18n('Get Admin Token'),
    description: i18n('Retrieve the admin API token for Garage'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const config = await garageToml.read().once()

    return {
      version: '1' as const,
      title: 'Admin Token',
      message:
        'Use this token to authenticate with the Garage admin API. Include it as a Bearer token in the Authorization header.',
      result: {
        type: 'single',
        name: 'Admin Token',
        description: null,
        value: config?.admin?.admin_token ?? 'UNKNOWN',
        masked: true,
        copyable: true,
        qr: false,
      },
    }
  },
)
