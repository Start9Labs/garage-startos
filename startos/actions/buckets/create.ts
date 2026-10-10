import { i18n } from '../../i18n'
import { sdk } from '../../sdk'
import { createGarageSub } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  bucketName: Value.text({
    name: i18n('Bucket Name'),
    description: i18n(
      'The name S3 clients use for this bucket. Lowercase letters, numbers, hyphens and dots.',
    ),
    required: true,
    default: null,
    placeholder: i18n('my-bucket'),
    minLength: 1,
    maxLength: 63,
    patterns: [
      {
        regex: '^[a-z0-9][a-z0-9.-]*[a-z0-9]$',
        description: i18n(
          'Must start and end with lowercase letter or number, may contain hyphens and dots',
        ),
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
    group: i18n('Buckets'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    bucketName: undefined,
  }),

  async ({ effects, input }) => {
    const { sub, env } = await createGarageSub(effects)

    await sub.execFail(['/garage', 'bucket', 'create', input.bucketName], {
      env,
    })

    // Fetch bucket info for accurate details
    const info = await sub.exec(
      ['/garage', 'bucket', 'info', input.bucketName],
      { env },
    )
    const infoOut = String(info.stdout || '')

    const bucketIdMatch = infoOut.match(/Bucket:\s*([0-9a-f]+)/)
    const objectsMatch = infoOut.match(/Objects:\s*(\d+)/)
    const sizeMatch = infoOut.match(/Size:\s*(.+)/)

    const bucketId = bucketIdMatch?.[1] ?? i18n('unknown')
    const objects = objectsMatch?.[1] ?? '0'
    const size = sizeMatch?.[1]?.trim() ?? '0 B'

    return {
      version: '1' as const,
      title: i18n('Bucket Created'),
      message: i18n('Bucket "${name}" created successfully.', { name: input.bucketName }),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Bucket Name'),
            description: null,
            value: input.bucketName,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Bucket ID'),
            description: null,
            value: bucketId,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Objects'),
            description: null,
            value: objects,
            masked: false,
            copyable: false,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Size'),
            description: null,
            value: size,
            masked: false,
            copyable: false,
            qr: false,
          },
        ],
      },
    }
  },
)
