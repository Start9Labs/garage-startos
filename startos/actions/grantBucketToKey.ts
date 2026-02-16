import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { generateGarageToml } from '../garageConfig'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  bucketName: Value.text({
    name: 'Bucket Name',
    description:
      'The bucket to manage access for. Use "List Buckets" to see available buckets.',
    required: true,
    default: null,
    placeholder: 'my-bucket',
    minLength: 1,
    maxLength: 63,
    patterns: [],
    inputmode: 'text',
  }),
  keyId: Value.text({
    name: 'API Key ID',
    description:
      'The key ID to grant access to (starts with GK). Use "List API Keys" to find it.',
    required: true,
    default: null,
    placeholder: 'GK...',
    minLength: 1,
    maxLength: 128,
    patterns: [],
    inputmode: 'text',
  }),
  read: Value.toggle({
    name: 'Read',
    description: 'Allow reading objects from the bucket',
    default: true,
  }),
  write: Value.toggle({
    name: 'Write',
    description: 'Allow writing objects to the bucket',
    default: true,
  }),
  owner: Value.toggle({
    name: 'Owner',
    description:
      'Grant owner permissions (delete objects, manage bucket settings)',
    default: false,
  }),
})

export const grantBucketToKey = sdk.Action.withInput(
  'grant-bucket-to-key',

  async ({ effects }) => ({
    name: i18n('Grant Bucket Access to Key'),
    description: i18n(
      'Allow a specific API key to access a bucket',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    bucketName: undefined,
    keyId: undefined,
    read: true,
    write: true,
    owner: false,
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

    if (!input.read && !input.write && !input.owner) {
      throw new Error(
        'At least one permission (Read, Write, or Owner) must be selected.',
      )
    }

    const args = ['/garage', 'bucket', 'allow', input.bucketName]
    if (input.read) args.push('--read')
    if (input.write) args.push('--write')
    if (input.owner) args.push('--owner')
    args.push('--key', input.keyId)

    const result = await garageSub.exec(args, { env })

    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to grant access: ${result.stderr || result.stdout}`,
      )
    }

    const perms = [
      input.read ? 'Read' : null,
      input.write ? 'Write' : null,
      input.owner ? 'Owner' : null,
    ]
      .filter(Boolean)
      .join(', ')

    return {
      version: '1' as const,
      title: 'Access Granted',
      message: `Key "${input.keyId}" now has ${perms} access to bucket "${input.bucketName}".`,
      result: null,
    }
  },
)
