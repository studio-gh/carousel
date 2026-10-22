export type LogoPosition = 'tl'|'tr'|'bl'|'br'|'top'|'bottom'|'center'
export type Point = { x:number; y:number }
export function logoPosition(pos:LogoPosition, W:number, H:number, lw:number, lh:number):Point {
  const pad = W * 0.05
  switch(pos){
    case 'tl': return {x:pad,y:pad}
    case 'tr': return {x:W-pad-lw,y:pad}
    case 'bl': return {x:pad,y:H-pad-lh}
    case 'br': return {x:W-pad-lw,y:H-pad-lh}
    case 'top': return {x:(W-lw)/2,y:pad}
    case 'bottom': return {x:(W-lw)/2,y:H-pad-lh}
    case 'center': default: return {x:(W-lw)/2,y:(H-lh)/2}
  }
}
