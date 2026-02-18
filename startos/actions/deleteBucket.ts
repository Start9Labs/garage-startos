import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { createGarageSub, parseBucketList } from './garageSubContainer'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  bucketNames: Value.dynamicMultiselect(async ({ effects }) => {
    const { sub, env } = await createGarageSub(effects)
    const result = await sub.exec(['/garage', 'bucket', 'list'], { env })
    const buckets = parseBucketList(String(result.stdout || ''))
    buckets.sort((a, b) => a.name.localeCompare(b.name))

    if (buckets.length === 0) {
      return {
        name: 'Buckets',
        description: null,
        warning: 'No buckets found.',
        default: [],
        values: { _none: 'No buckets available' } as Record<string, string>,
        disabled: ['_none'],
        minLength: null,
        maxLength: null,
      }
    }

    const values: Record<string, string> = {}
    for (const b of buckets) {
      values[b.name] = b.name
    }

    return {
      name: 'Buckets',
      description: `${buckets.length} bucket(s) available. Select one or more to delete.`,
      warning: null,
      default: [],
      values,
      minLength: 1,
      maxLength: null,
    }
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

  async () => null,

  async ({ effects, input }) => {
    if (input.bucketNames.length === 0) {
      throw new Error('No buckets selected.')
    }

    const { sub, env } = await createGarageSub(effects)
    const errors: string[] = []
    const deleted: string[] = []

    for (const name of input.bucketNames) {
      const result = await sub.exec(
        ['/garage', 'bucket', 'delete', '--yes', name],
        { env },
      )
      if (result.exitCode !== 0) {
        errors.push(`${name}: ${result.stderr || result.stdout}`)
      } else {
        deleted.push(name)
      }
    }

    if (errors.length > 0 && deleted.length === 0) {
      throw new Error(`Failed to delete bucket(s):\n${errors.join('\n')}`)
    }

    const message =
      deleted.length === 1
        ? `Bucket "${deleted[0]}" has been permanently deleted.`
        : `${deleted.length} buckets have been permanently deleted.`

    if (errors.length > 0) {
      return {
        version: '1' as const,
        title: 'Partial Deletion',
        message: `${message}\n\nFailed to delete:\n${errors.join('\n')}`,
        result: null,
      }
    }

    return {
      version: '1' as const,
      title: deleted.length === 1 ? 'Bucket Deleted' : 'Buckets Deleted',
      message,
      result: null,
    }
  },
)
