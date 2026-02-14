import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { adminPort } from '../utils'
import { storeJson } from '../fileModels/store.json'

export const listApiKeys = sdk.Action.withoutInput(
  'list-api-keys',

  async ({ effects }) => ({
    name: i18n('List API Keys'),
    description: i18n('List all S3 API keys'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const store = await storeJson.read((s) => s).once()
    const token = store?.adminToken ?? ''

    const res = await fetch(
      `http://127.0.0.1:${adminPort}/v2/ListKeys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: '{}',
      },
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to list API keys: ${text}`)
    }

    const data = (await res.json()) as Array<{
      id: string
      name: string
    }>

    const keyList = data.map((k) => `${k.name}: ${k.id}`).join('\n')

    return {
      version: '1' as const,
      title: 'S3 API Keys',
      message: data.length === 0 ? 'No API keys found.' : keyList,
      result: null,
    }
  },
)
