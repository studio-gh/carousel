import type { Project } from '../project/schema'
export function snapshotProject(project: Project): string { return JSON.stringify(project) }
export function restoreSnapshot(snapshot: string): Project { return JSON.parse(snapshot) as Project }
