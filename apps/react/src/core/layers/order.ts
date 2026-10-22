export const CANONICAL_LAYER_KEYS = ['background','image','layer2','overlay','text','cutout','logo','signature','swipeHint','extra'] as const
export type LayerKey = typeof CANONICAL_LAYER_KEYS[number]
export function getEffectiveLayerOrder(order:string[]|undefined):string[] {
  const incoming = Array.isArray(order) ? order : []
  const valid = incoming.filter(Boolean)
  const missing = CANONICAL_LAYER_KEYS.filter(key=>!valid.includes(key))
  return [...valid, ...missing]
}
