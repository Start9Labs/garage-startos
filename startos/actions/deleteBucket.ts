import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { generateGarageToml } from '../garageConfig'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  bucketName: Value.text({
    name: 'Bucket Name',
    description:
      'The name of the bucket to delete. Use "List Buckets" to see available buckets.',
    required: true,
    default: null,
    placeholder: 'my-bucket',
    minLength: 1,
    maxLength: 63,
    patterns: [],
    inputmode: 'text',
  }),
})

export const deleteBucket = sdk.Action.withInput(
  'delete-bucket',

  async ({ effects }) => ({
    name: i18n('Delete Bucket'),
    description: i18n('Delete an S3 bucket by name'),
    warning: i18n(
      'This will permanently delete the bucket and all its contents.',
    ),
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
      ['/garage', 'bucket', 'delete', '--yes', input.bucketName],
      { env },
    )

    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to delete bucket: ${result.stderr || result.stdout}`,
      )
    }

    return {
      version: '1' as const,
      title: 'Bucket Deleted',
      message: `Bucket "${input.bucketName}" has been permanently deleted.`,
      result: null,
    }
  },
)
