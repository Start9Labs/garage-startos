import { garageToml } from '../fileModels/garage.toml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const showMetricsToken = sdk.Action.withoutInput(
  'show-metrics-token',

  async () => ({
    name: i18n('Show Metrics Token'),
    description: i18n(
      "Show the bearer token for scraping Garage's Prometheus metrics",
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const token = await garageToml.read((c) => c.admin.metrics_token).once()
    if (!token) throw new Error('No metrics token is set')

    return {
      version: '1' as const,
      title: i18n('Metrics Token'),
      message: i18n(
        'Send this as a bearer token when scraping /metrics on the Admin API.',
      ),
      result: {
        type: 'single',
        name: i18n('Metrics Token'),
        description: null,
        value: token,
        masked: true,
        copyable: true,
        qr: false,
        launchable: false,
      },
    }
  },
)
