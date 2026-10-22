export type ImageTransform = { dw:number; dh:number; left:number; top:number; excessX:number; excessY:number }

export function computeImageBox(natW:number, natH:number, boxW:number, boxH:number, scale=1, offX=0.5, offY=0.5): ImageTransform {
  const coverScale = Math.max(boxW / natW, boxH / natH)
  const finalScale = coverScale * Math.max(1, scale)
  const dw = natW * finalScale
  const dh = natH * finalScale
  const excessX = Math.max(0, dw - boxW)
  const excessY = Math.max(0, dh - boxH)
  const left = -excessX * (offX ?? 0.5)
  const top = -excessY * (offY ?? 0.5)
  return { dw, dh, left, top, excessX, excessY }
}

export function offScale(W:number, exportWidth:number): number {
  return W / exportWidth
}
