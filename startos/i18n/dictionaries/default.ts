export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'S3 API': 0,
  'The S3 API is ready': 1,
  'The S3 API is not ready': 2,

  // interfaces.ts
  'S3 API Interface': 3,
  'S3-compatible object storage API': 4,
  'Admin API': 5,
  'Garage administration API': 6,

  // actions
  'Get Admin Token': 7,
  'Retrieve the admin API token for Garage': 8,
  'Create Bucket': 9,
  'Create a new S3 bucket': 10,
  'Create API Key': 11,
  'Create a new S3 API key pair': 12,
  'List Buckets': 13,
  'List all S3 buckets': 14,
  'List API Keys': 15,
  'List all S3 API keys': 16,
  'Retrieve the admin API token': 17,
  'Delete API Key': 18,
  'Delete an S3 API key by its key ID': 19,
  'This will permanently delete the API key.': 20,
  'Delete Bucket': 21,
  'Delete an S3 bucket by name': 22,
  'This will permanently delete the bucket and all its contents.': 23,
  'Grant Key Access to Buckets': 24,
  'Grant an API key read/write access to a specific bucket': 25,
  'Grant Bucket Access to Keys': 26,
  'Allow a specific API key to access a bucket': 27,
  'The Admin API is ready': 28,
  'The Admin API is not ready': 29,
  'Cluster Status': 30,
  'Show the status of the Garage cluster': 31,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
