import type { Project } from '../project/schema'
import { snapshotProject, restoreSnapshot } from './snapshots'
export type HistoryState = { past:string[]; present:string; future:string[] }
export function createHistory(project:Project):HistoryState { return {past:[],present:snapshotProject(project),future:[]} }
export function pushHistory(history:HistoryState, project:Project, limit=50):HistoryState {
 return {past:[...history.past,history.present].slice(-limit),present:snapshotProject(project),future:[]}
}
export function undo(history:HistoryState):{history:HistoryState; project:Project|null} {
 if(!history.past.length) return {history,project:null}
 const previous=history.past[history.past.length-1]
 return {history:{past:history.past.slice(0,-1),present:previous,future:[history.present,...history.future]},project:restoreSnapshot(previous)}
}
export function redo(history:HistoryState):{history:HistoryState; project:Project|null} {
 if(!history.future.length) return {history,project:null}
 const next=history.future[0]
 return {history:{past:[...history.past,history.present],present:next,future:history.future.slice(1)},project:restoreSnapshot(next)}
}
