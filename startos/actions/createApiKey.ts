import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { createGarageSub } from './garageSubContainer'

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
    group: 'API Keys',
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    keyName: undefined,
  }),

  async ({ effects, input }) => {
    const { sub, env } = await createGarageSub(effects)

    const result = await sub.execFail(
      ['/garage', 'key', 'create', input.keyName],
      { env },
    )

    const stdout = String(result.stdout || '')
    const accessKeyMatch = stdout.match(/Key ID:\s*(\S+)/)
    const secretKeyMatch = stdout.match(/Secret key:\s*(\S+)/)

    const accessKeyId = accessKeyMatch?.[1] ?? 'See output'
    const secretAccessKey = secretKeyMatch?.[1] ?? 'See output'

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
            value: accessKeyId,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: 'Secret Access Key',
            description: null,
            value: secretAccessKey,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
