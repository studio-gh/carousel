import { ProjectSchema, type Project } from './schema'
export const CURRENT_SCHEMA_VERSION = 1
export function migrateProject(input: unknown): Project {
  const parsed = ProjectSchema.parse(input)
  if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) throw new Error(`Unsupported project schema ${parsed.schemaVersion}`)
  return { ...parsed, schemaVersion: CURRENT_SCHEMA_VERSION }
}
