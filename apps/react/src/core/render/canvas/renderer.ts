import type { RenderScene } from '../contract'
import { computeImageBox } from '../../geometry/image'
import { buildBrowserTextLayout } from '../../typography/layout'

export type CanvasRenderOptions = { clear?: boolean; pixelRatio?: number; includeText?: boolean }

function setFont(ctx: CanvasRenderingContext2D, size: number, weight: number | string | undefined, family: string | undefined) {
  ctx.font = String(weight ?? 700) + ' ' + size + 'px "' + (family ?? 'Inter') + '", Arial, sans-serif'
}
function contrastTextColor(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#FAFAF9'
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > .55 ? '#14161A' : '#FAFAF9'
}
function drawStyledLine(ctx: CanvasRenderingContext2D, line: any[], x: number, y: number, align: 'left'|'center'|'right', color: string, accent: string, size: number, lineHeight: number) {
  const widths = line.map((t, i) => ctx.measureText(t.text).width + (i ? ctx.measureText(' ').width : 0))
  const total = widths.reduce((a, b) => a + b, 0)
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x
  for (let i = 0; i < line.length; i++) {
    const token = line[i], w = ctx.measureText(token.text).width
    if (i) cx += ctx.measureText(' ').width
    if (token.style === 'highlight') {
      const pad = w * .08
      ctx.fillStyle = accent
      ctx.fillRect(cx - pad, y + lineHeight * .06, w + pad * 2, lineHeight * .82)
      ctx.fillStyle = contrastTextColor(accent)
    } else if (token.style === 'outline') {
      ctx.fillStyle = 'transparent'; ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, size * .045); ctx.strokeText(token.text, cx, y + size)
    } else ctx.fillStyle = token.style === 'accent' ? accent : color
    ctx.fillText(token.text, cx, y + size)
    cx += w
  }
}
async function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null
  const img = new Image(); img.decoding = 'async'; img.src = src
  try { await img.decode(); return img } catch { return null }
}
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, box: {x:number;y:number;w:number;h:number}, scale: number, offX: number, offY: number, radius: number) {
  const t = computeImageBox(img.naturalWidth, img.naturalHeight, box.w, box.h, scale, offX, offY)
  ctx.save()
  if (radius > 0) { const r = Math.min(radius, box.w / 2, box.h / 2); ctx.beginPath(); ctx.roundRect(box.x, box.y, box.w, box.h, r); ctx.clip() }
  else { ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip() }
  ctx.drawImage(img, box.x + t.left, box.y + t.top, t.dw, t.dh)
  ctx.restore()
}
function scaleBox(b: {x:number;y:number;w:number;h:number}, k: number) { return {x:b.x*k,y:b.y*k,w:b.w*k,h:b.h*k} }
function scaleGeometry(g: any, k: number) { return {canvas:scaleBox(g.canvas,k),image:scaleBox(g.image,k),text:scaleBox(g.text,k),body:scaleBox(g.body,k)} }
function hexWithAlpha(c: string, a: number) { return /^#([0-9a-f]{6})$/i.test(c) ? c + Math.round(a * 255).toString(16).padStart(2, '0') : 'rgba(0,0,0,' + a + ')' }
function paintOverlay(ctx: CanvasRenderingContext2D, scene: RenderScene) {
  const s = scene.slide, g = scene.geometry.image
  if (!s.image || s.overlayOpacity <= 0) return
  const alpha = Math.max(0, Math.min(1, s.overlayOpacity / 100)), color = s.overlayColor || '#000000'
  const gradient = s.overlayDirection === 'top' ? ctx.createLinearGradient(0, g.y, 0, g.y + g.h)
    : s.overlayDirection === 'left' ? ctx.createLinearGradient(g.x, g.y, g.x + g.w, g.y)
    : s.overlayDirection === 'right' ? ctx.createLinearGradient(g.x + g.w, g.y, g.x, g.y)
    : ctx.createLinearGradient(0, g.y + g.h, 0, g.y)
  gradient.addColorStop(0, hexWithAlpha(color, alpha)); gradient.addColorStop(1, hexWithAlpha(color, 0))
  ctx.save(); ctx.fillStyle = gradient; ctx.fillRect(g.x, g.y, g.w, g.h); ctx.restore()
}
function logoPosition(pos: string, W: number, H: number, lw: number, lh: number) {
  const p = W * .05
  if (pos === 'tr') return {x:W-p-lw,y:p}
  if (pos === 'bl') return {x:p,y:H-p-lh}
  if (pos === 'br') return {x:W-p-lw,y:H-p-lh}
  if (pos === 'top') return {x:(W-lw)/2,y:p}
  if (pos === 'bottom') return {x:(W-lw)/2,y:H-p-lh}
  if (pos === 'center') return {x:(W-lw)/2,y:(H-lh)/2}
  return {x:p,y:p}
}

export async function renderSceneToCanvas(canvas: HTMLCanvasElement, scene: RenderScene, options: CanvasRenderOptions = {}): Promise<{width:number;height:number}> {
  const ratio = options.pixelRatio ?? 1
  const W = scene.exportWidth || scene.width, H = scene.height * (W / scene.width), includeText = options.includeText !== false
  canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio)
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  if (options.clear !== false) ctx.clearRect(0, 0, W, H)
  const scale = W / scene.width, g = scene.geometry, s = scene.slide
  ctx.fillStyle = s.background; ctx.fillRect(0, 0, W, H)
  const main = await loadImage(s.image ?? ''), layer2 = await loadImage(s.layer2Image ?? '')
  const logo = await loadImage(s.logoImage ?? ''), cutout = await loadImage(s.cutoutImage ?? '')
  for (const layer of scene.layers) {
    if (s.layerHidden[layer]) continue
    if (layer === 'image' && main) drawCover(ctx, main, scaleBox(g.image, scale), s.imageScale, s.imageOffsetX, s.imageOffsetY, s.imageRadius * scale)
    if (layer === 'layer2' && layer2) {
      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, s.layer2Opacity / 100)); ctx.globalCompositeOperation = (s.layer2Blend as GlobalCompositeOperation) || 'source-over'
      drawCover(ctx, layer2, scaleBox(g.image, scale), s.layer2Scale, s.layer2OffsetX, s.layer2OffsetY, s.imageRadius * scale); ctx.restore()
    }
    if (layer === 'overlay') paintOverlay(ctx, {...scene,width:W,height:H,exportWidth:W,geometry:scaleGeometry(g,scale),safeZones:scene.safeZones,layers:scene.layers,slide:s})
    if (layer === 'text' && includeText) {
      const layout = scene.textLayout ?? buildBrowserTextLayout(s, g.text, scene.width, scene.height), k = scale, accent = s.headAccentColor || '#FF5A36'
      ctx.textBaseline = 'alphabetic'
      if (layout.kicker) {
        setFont(ctx, layout.kicker.size*k, 700, s.bodyFont); ctx.fillStyle = s.kickerColor || s.textColor
        ctx.fillText(layout.kicker.lines[0], layout.kicker.x*k, (layout.kicker.y + layout.kicker.size)*k)
      }
      layout.heading.lines.forEach((line, i) => { if (!line.length) return; setFont(ctx, layout.heading.size*k, s.headWeight, s.headFont); drawStyledLine(ctx,line,layout.heading.x*k,(layout.heading.y+i*layout.heading.lineHeight)*k,s.align,s.textColor,accent,layout.heading.size*k,layout.heading.lineHeight*k) })
      if (layout.body.lines.length) { setFont(ctx, layout.body.size*k, s.bodyWeight, s.bodyFont); layout.body.lines.forEach((line,i) => ctx.fillText(line,layout.body.x*k,(layout.body.y+i*layout.body.lineHeight+layout.body.size)*k)) }
    }
    if (layer === 'cutout' && cutout) drawCover(ctx, cutout, scaleBox(g.canvas, scale), 1, .5, .5, 0)
    if (layer === 'logo' && logo) { const lw=W*s.logoSize, lh=lw*(logo.naturalHeight/logo.naturalWidth), p=logoPosition(s.logoPos,W,H,lw,lh); ctx.drawImage(logo,p.x,p.y,lw,lh) }
    if (layer === 'signature' && s.signature) { ctx.fillStyle=s.textColor; setFont(ctx,24*scale,400,s.bodyFont); ctx.fillText(s.signature,W*.05,H*.9) }
    if (layer === 'swipeHint' && s.swipeHint) { ctx.fillStyle=s.textColor; setFont(ctx,18*scale,700,s.bodyFont); ctx.textAlign='right'; ctx.fillText('SWIPE →',W*.95,H*.94); ctx.textAlign='left' }
    if (layer === 'extra') for (const textLayer of s.textLayers) if (!s.layerHidden['text:'+textLayer.id]) {
      ctx.fillStyle=textLayer.color??s.textColor; setFont(ctx,(textLayer.fontSizePx??42)*scale,textLayer.fontWeight??700,textLayer.fontFamily??s.bodyFont)
      ctx.fillText(textLayer.text,W*(1-textLayer.boxWRatio)/2+textLayer.offsetX*scale,H*(1-textLayer.boxHRatio)/2+textLayer.offsetY*scale)
    }
  }
  return {width:W,height:H}
}
