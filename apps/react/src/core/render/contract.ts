import type { Slide } from '../project/schema'
import { applyImageInset, computeSlideGeometry } from '../geometry/getBoxes'
import { computeImageBox } from '../geometry/image'
import { getEffectiveLayerOrder } from '../layers/order'
import { getSafeZone } from '../safeZones'
import { buildBrowserTextLayout, type TextLayout } from '../typography/layout'
export type RenderScene = ReturnType<typeof buildRenderScene>
export function buildRenderScene(slide:Slide,W:number,H:number,exportWidth=W,textLayout?:TextLayout){
  const rawGeometry=computeSlideGeometry(slide,W,H)
  const geometry=applyImageInset(rawGeometry,slide,W)
  const image=slide.image ? computeImageBox(W,H,geometry.image.w,geometry.image.h,slide.imageScale,slide.imageOffsetX,slide.imageOffsetY) : null
  const safeRect=getSafeZone('instagram').rect(W,H)
  const layout=textLayout ?? (typeof document!=='undefined' ? buildBrowserTextLayout(slide,geometry.text,W,H) : undefined)
  return {slide,width:W,height:H,exportWidth,geometry,image,safeZones:{rect:safeRect,editableOnly:true},layers:getEffectiveLayerOrder(slide.layerOrder),textLayout:layout}
}
