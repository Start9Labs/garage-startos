import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { generateGarageToml } from '../garageConfig'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  keyId: Value.text({
    name: 'Key ID',
    description:
      'The key ID to delete (starts with GK). Use "List API Keys" to find it.',
    required: true,
    default: null,
    placeholder: 'GK...',
    minLength: 1,
    maxLength: 128,
    patterns: [],
    inputmode: 'text',
  }),
})

export const deleteApiKey = sdk.Action.withInput(
  'delete-api-key',

  async ({ effects }) => ({
    name: i18n('Delete API Key'),
    description: i18n('Delete an S3 API key by its key ID'),
    warning: i18n('This will permanently delete the API key.'),
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    keyId: undefined,
  }),

  async ({ effects, input }) => {
    const store = await storeJson.read((s) => s).once()
    const rpcSecret = store?.rpcSecret ?? ''
    const adminToken = store?.adminToken ?? ''

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
      ['/garage', 'key', 'delete', '--yes', input.keyId],
      { env: { GARAGE_CONFIG_FILE: '/etc/garage.toml' } },
    )

    if (result.exitCode !== 0) {
      throw new Error(
        `Failed to delete API key: ${result.stderr || result.stdout}`,
      )
    }

    return {
      version: '1' as const,
      title: 'API Key Deleted',
      message: `API key "${input.keyId}" has been permanently deleted.`,
      result: null,
    }
  },
)
