import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { adminPort } from '../utils'
import { storeJson } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  keyName: Value.text({
    name: 'Key Name',
    description: 'A friendly name for this API key',
    required: true,
    default: null,
    placeholder: 'my-app-key',
    minLength: 1,
    maxLength: 128,
    patterns: [],
    inputmode: 'text',
  }),
})

export const createApiKey = sdk.Action.withInput(
  'create-api-key',

  async ({ effects }) => ({
    name: i18n('Create API Key'),
    description: i18n('Create a new S3 API key pair'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    keyName: undefined,
  }),

  async ({ effects, input }) => {
    const store = await storeJson.read((s) => s).once()
    const token = store?.adminToken ?? ''

    const res = await fetch(
      `http://127.0.0.1:${adminPort}/v2/CreateKey`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: input.keyName,
        }),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to create API key: ${text}`)
    }

    const data = (await res.json()) as {
      accessKeyId: string
      secretAccessKey: string
    }

    return {
      version: '1' as const,
      title: 'API Key Created',
      message: `API key "${input.keyName}" created successfully. Save the secret key now — it cannot be retrieved later.`,
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: 'Access Key ID',
            description: null,
            value: data.accessKeyId,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: 'Secret Access Key',
            description: null,
            value: data.secretAccessKey,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
