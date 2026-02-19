import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { generateGarageToml } from '../garageConfig'

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
    group: 'Buckets',
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    bucketName: undefined,
  }),

  async ({ effects, input }) => {
    const store = await storeJson.read((s) => s).once()
    const rpcSecret = store?.rpcSecret ?? ''
    const adminToken = store?.adminToken ?? ''
    const env = { GARAGE_CONFIG_FILE: '/etc/garage.toml' }

    const garageSub = await sdk.SubContainer.of(
      effects,
      { imageId: 'garage' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'garage-action-sub',
    )

    await garageSub.writeFile(
      '/etc/garage.toml',
      generateGarageToml({ rpcSecret, adminToken }),
    )

    const result = await garageSub.exec(
      ['/garage', 'bucket', 'create', input.bucketName],
      { env },
    )

    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to create bucket: ${result.stderr || result.stdout}`,
      )
    }

    // Fetch bucket info for accurate details
    const info = await garageSub.exec(
      ['/garage', 'bucket', 'info', input.bucketName],
      { env },
    )
    const infoOut = String(info.stdout || '')

    const bucketIdMatch = infoOut.match(/Bucket:\s*([0-9a-f]+)/)
    const objectsMatch = infoOut.match(/Objects:\s*(\d+)/)
    const sizeMatch = infoOut.match(/Size:\s*(.+)/)

    const bucketId = bucketIdMatch?.[1] ?? 'unknown'
    const objects = objectsMatch?.[1] ?? '0'
    const size = sizeMatch?.[1]?.trim() ?? '0 B'

    return {
      version: '1' as const,
      title: 'Bucket Created',
      message: `Bucket "${input.bucketName}" created successfully.`,
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: 'Bucket Name',
            description: null,
            value: input.bucketName,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: 'Bucket ID',
            description: null,
            value: bucketId,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: 'Objects',
            description: null,
            value: objects,
            masked: false,
            copyable: false,
            qr: false,
          },
          {
            type: 'single' as const,
            name: 'Size',
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
