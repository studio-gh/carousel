import type { Slide } from '../project/schema'

export type Box = { x: number; y: number; w: number; h: number }
export type SlideGeometry = { canvas: Box; image: Box; text: Box; body: Box }

export function computeSlideGeometry(slide: Slide, W: number, H: number): SlideGeometry {
  const canvas: Box = { x: 0, y: 0, w: W, h: H }
  let geometry: Omit<SlideGeometry, 'canvas'>
  switch (slide.layout) {
    case 'imageleft':
      geometry = { image: { x: 0, y: 0, w: W / 2, h: H }, text: { x: W / 2, y: 0, w: W / 2, h: H }, body: { x: W / 2, y: 0, w: W / 2, h: H } }; break
    case 'imageright':
      geometry = { image: { x: W / 2, y: 0, w: W / 2, h: H }, text: { x: 0, y: 0, w: W / 2, h: H }, body: { x: 0, y: 0, w: W / 2, h: H } }; break
    case 'imagetop':
      geometry = { image: { x: 0, y: 0, w: W, h: H / 2 }, text: { x: 0, y: H / 2, w: W, h: H / 2 }, body: { x: 0, y: H / 2, w: W, h: H / 2 } }; break
    case 'imagebottom':
      geometry = { image: { x: 0, y: H / 2, w: W, h: H / 2 }, text: { x: 0, y: 0, w: W, h: H / 2 }, body: { x: 0, y: 0, w: W, h: H / 2 } }; break
    case 'editorial': {
      const textY = H * 0.56, textH = H * 0.44, gap = W * 0.04, colW = (W - gap) / 2
      geometry = { image: { x: 0, y: 0, w: W, h: textY }, text: { x: 0, y: textY, w: colW, h: textH }, body: { x: colW + gap, y: textY, w: colW, h: textH } }; break
    }
    case 'columnasym': {
      const imgW = W * 0.62
      geometry = { image: { x: 0, y: 0, w: imgW, h: H }, text: { x: imgW, y: 0, w: W - imgW, h: H }, body: { x: imgW, y: 0, w: W - imgW, h: H } }; break
    }
    case 'goldencanon': {
      const split = H * 0.618
      geometry = { image: { x: 0, y: 0, w: W, h: split }, text: { x: 0, y: split, w: W, h: H - split }, body: { x: 0, y: split, w: W, h: H - split } }; break
    }
    case 'axial': {
      const colW = W * 0.28, gap = W * 0.03
      geometry = { image: { x: colW + gap, y: 0, w: W - 2 * (colW + gap), h: H }, text: { x: 0, y: 0, w: colW, h: H }, body: { x: W - colW, y: 0, w: colW, h: H } }; break
    }
    case 'fullbleed':
    default:
      geometry = { image: { x: 0, y: 0, w: W, h: H }, text: { x: 0, y: 0, w: W, h: H }, body: { x: 0, y: 0, w: W, h: H } }
  }
  return { canvas, ...geometry }
}

export function applyImageInset(geometry: SlideGeometry, slide: Slide, W: number): SlideGeometry {
  const insetPx = Math.min((slide.imageInset ?? 0) * W, geometry.image.w / 2 - 4, geometry.image.h / 2 - 4)
  if (insetPx <= 0) return geometry
  return { ...geometry, image: { x: geometry.image.x + insetPx, y: geometry.image.y + insetPx, w: geometry.image.w - insetPx * 2, h: geometry.image.h - insetPx * 2 } }
}
