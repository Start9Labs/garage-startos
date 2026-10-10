import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { createGarageSub } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  keyName: Value.text({
    name: i18n('Key Name'),
    description: i18n(
      'A label to tell keys apart in lists. It is not part of the credentials.',
    ),
    required: true,
    default: null,
    placeholder: i18n('my-app-key'),
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
    group: i18n('API Keys'),
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

    if (!accessKeyMatch || !secretKeyMatch) {
      throw new Error(i18n('Garage created the key but its credentials could not be read. Delete it and create a new key.'))
    }
    const accessKeyId = accessKeyMatch[1]
    const secretAccessKey = secretKeyMatch[1]

    return {
      version: '1' as const,
      title: i18n('API Key Created'),
      message: i18n('API key "${name}" created successfully. Save the secret key now — it cannot be retrieved later.', { name: input.keyName }),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Access Key ID'),
            description: null,
            value: accessKeyId,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Secret Access Key'),
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
