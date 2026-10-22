import type { Project, Slide, TextLayer } from '../project/schema'
import { computeSlideGeometry } from '../geometry/getBoxes'
import { getSafeZone, boxOutsideSafeRect } from '../safeZones'
export type PreflightIssue = { slideIdx:number; severity:'warn'|'error'; code:string; message:string }
const splitLayouts = new Set<Slide['layout']>(['imageleft','imageright','imagetop','imagebottom','editorial','columnasym','goldencanon','axial'])
export function runPreflightChecks(project:Project):PreflightIssue[] {
  const issues:PreflightIssue[] = []
  const [W,H] = project.aspect === 'portrait' ? [1080,1350] : project.aspect === 'square' ? [1080,1080] : [1080,1920]
  const safe = getSafeZone('instagram').rect(W,H)
  project.slides.forEach((slide:Slide, slideIdx:number)=>{
    const hasText = Boolean(slide.heading.trim() || slide.body.trim() || slide.textLayers.some((t:TextLayer)=>t.text.trim()))
    if(!hasText && !slide.image){ issues.push({slideIdx,severity:'warn',code:'EMPTY_SLIDE',message:'Slide vazio, sem texto nem foto.'}); return }
    if(splitLayouts.has(slide.layout) && !slide.image) issues.push({slideIdx,severity:'warn',code:'MISSING_IMAGE',message:`Layout "${slide.layout}" reserva espaço para foto, mas nenhuma foto foi adicionada.`})
    if(slide.logoImage){
      const lw = slide.logoSize * W
      const lp = {x:slide.logoPos==='tl'||slide.logoPos==='bl'?W*.05:W-W*.05-lw,y:slide.logoPos==='tl'||slide.logoPos==='tr'?H*.05:H-H*.05-lw}
      if(boxOutsideSafeRect({x:lp.x,y:lp.y,w:lw,h:lw},safe)) issues.push({slideIdx,severity:'warn',code:'LOGO_SAFE_ZONE',message:'O logo está perto ou fora da área segura.'})
    }
    computeSlideGeometry(slide,W,H)
  })
  return issues
}
