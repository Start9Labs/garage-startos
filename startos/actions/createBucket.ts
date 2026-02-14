import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { adminPort } from '../utils'
import { storeJson } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  bucketName: Value.text({
    name: 'Bucket Name',
    description: 'Name for the new S3 bucket (lowercase, hyphens allowed)',
    required: true,
    default: null,
    placeholder: 'my-bucket',
    minLength: 1,
    maxLength: 63,
    patterns: [
      {
        regex: '^[a-z0-9][a-z0-9.-]*[a-z0-9]$',
        description:
          'Must start and end with lowercase letter or number, may contain hyphens and dots',
      },
    ],
    inputmode: 'text',
  }),
})

export const createBucket = sdk.Action.withInput(
  'create-bucket',

  async ({ effects }) => ({
    name: i18n('Create Bucket'),
    description: i18n('Create a new S3 bucket'),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    bucketName: undefined,
  }),

  async ({ effects, input }) => {
    const store = await storeJson.read((s) => s).once()
    const token = store?.adminToken ?? ''

    const res = await fetch(
      `http://127.0.0.1:${adminPort}/v2/CreateBucket`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          globalAlias: input.bucketName,
        }),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Failed to create bucket: ${text}`)
    }

    const data = (await res.json()) as { id: string }

    return {
      version: '1' as const,
      title: 'Bucket Created',
      message: `Bucket "${input.bucketName}" created successfully.`,
      result: {
        type: 'single',
        name: 'Bucket ID',
        description: null,
        value: data.id,
        masked: false,
        copyable: true,
        qr: false,
      },
    }
  },
)
