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
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
