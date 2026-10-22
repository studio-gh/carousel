import type { Box } from '../geometry/getBoxes'
export type SafeZonePreset = 'instagram' | 'generous'
export type SafeZone = { preset:SafeZonePreset; rect:(W:number,H:number)=>Box }
const presets:Record<SafeZonePreset,SafeZone> = {
  instagram: { preset:'instagram', rect:(W,H)=>({x:W*.05,y:H*.05,w:W*.9,h:H*.9}) },
  generous: { preset:'generous', rect:(W,H)=>({x:W*.08,y:H*.08,w:W*.84,h:H*.84}) },
}
export function getSafeZone(preset:SafeZonePreset='instagram'):SafeZone { return presets[preset] }
export function boxOutsideSafeRect(box:Box, safe:Box):boolean { return box.x < safe.x || box.y < safe.y || box.x + box.w > safe.x + safe.w || box.y + box.h > safe.y + safe.h }
