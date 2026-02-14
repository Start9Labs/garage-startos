import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { adminPort } from '../utils'
import { storeJson } from '../fileModels/store.json'

export const listBuckets = sdk.Action.withoutInput(
  'list-buckets',

  async ({ effects }) => ({
    name: i18n('List Buckets'),
    description: i18n('List all S3 buckets'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const store = await storeJson.read((s) => s).once()
    const token = store?.adminToken ?? ''

    const res = await fetch(
      `http://127.0.0.1:${adminPort}/v2/ListBuckets`,
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
      throw new Error(`Failed to list buckets: ${text}`)
    }

    const data = (await res.json()) as Array<{
      id: string
      globalAliases: string[]
      localAliases: Array<{ alias: string }>
    }>

    const bucketList = data
      .map((b) => {
        const name =
          b.globalAliases?.[0] ?? b.localAliases?.[0]?.alias ?? b.id
        return name
      })
      .join('\n')

    return {
      version: '1' as const,
      title: 'S3 Buckets',
      message: data.length === 0 ? 'No buckets found.' : bucketList,
      result: null,
    }
  },
)
