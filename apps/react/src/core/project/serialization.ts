import { ProjectSchema, type Project } from './schema'
import { migrateProject } from './migrations'
export function serializeProject(project: Project): string { return JSON.stringify(ProjectSchema.parse(project)) }
export function deserializeProject(serialized: string): Project { return migrateProject(JSON.parse(serialized)) }
