import type { RenderScene } from '../contract'
import { buildBrowserTextLayout } from '../../typography/layout'

function esc(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function scaleBox(box: any, k: number) { return {x:box.x*k,y:box.y*k,w:box.w*k,h:box.h*k} }
function anchor(align: string) { return align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start' }
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
export function buildSlideSVG(scene: RenderScene, options: {includeText?:boolean} = {}) {
  const W = scene.exportWidth || scene.width, H = scene.height * W / scene.width, k = W / scene.width
  const s = scene.slide, g = scene.geometry, includeText = options.includeText !== false
  const out = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">']
  out.push('<defs><linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + esc(s.overlayColor) + '" stop-opacity="' + s.overlayOpacity/100 + '"/><stop offset="1" stop-color="' + esc(s.overlayColor) + '" stop-opacity="0"/></linearGradient></defs>')
  out.push('<rect width="100%" height="100%" fill="' + esc(s.background) + '"/>')
  for (const layer of scene.layers) {
    if (s.layerHidden[layer]) continue
    if (layer === 'image' && s.image) {
      const b = scaleBox(g.image,k)
      out.push('<svg x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" viewBox="0 0 ' + b.w + ' ' + b.h + '"><image href="' + esc(s.image) + '" width="' + b.w + '" height="' + b.h + '" preserveAspectRatio="xMidYMid slice"/></svg>')
    }
    if (layer === 'layer2' && s.layer2Image) {
      const b = scaleBox(g.image,k)
      out.push('<image href="' + esc(s.layer2Image) + '" x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" preserveAspectRatio="xMidYMid slice" opacity="' + s.layer2Opacity/100 + '" style="mix-blend-mode:' + esc(s.layer2Blend) + '"/>')
    }
    if (layer === 'overlay' && s.image) out.push('<rect x="' + g.image.x*k + '" y="' + g.image.y*k + '" width="' + g.image.w*k + '" height="' + g.image.h*k + '" fill="url(#overlay)"/>')
    if (layer === 'text' && includeText) {
      const l = scene.textLayout ?? buildBrowserTextLayout(s,g.text,scene.width,scene.height)
      const accent = s.headAccentColor || '#FF5A36'
      if (l.kicker) out.push('<text x="' + l.kicker.x*k + '" y="' + (l.kicker.y+l.kicker.size)*k + '" fill="' + esc(s.kickerColor || s.textColor) + '" font-family="' + esc(s.bodyFont) + '" font-size="' + l.kicker.size*k + '" font-weight="700">' + esc(l.kicker.lines[0]) + '</text>')
      l.heading.lines.forEach((line,i) => {
        if (!line.length) return
        const y = (l.heading.y + i*l.heading.lineHeight)*k
        const x = l.heading.x*k
        const wholeLine = line.map(t=>t.text).join(' ')
        if (s.align === 'left' || s.align === 'center' || s.align === 'right') {
          let cursorX = x
          const totalWidth = line.reduce((sum,t,index)=>sum + (index ? l.heading.size*.28 : 0) + t.text.length*l.heading.size*.52,0)*k
          if(s.align==='center') cursorX=x-totalWidth/2
          if(s.align==='right') cursorX=x-totalWidth
          const textRuns = line.map((t,index) => {
            const fill = t.style === 'accent' ? accent : t.style === 'highlight' ? '#14161A' : s.textColor
            const deco = t.style === 'outline' ? ' fill="none" stroke="' + esc(s.textColor) + '" stroke-width="' + Math.max(1,l.heading.size*k*.045) + '"' : ' fill="' + fill + '"'
            const run = '<tspan' + deco + '>' + esc(t.text) + '</tspan>'
            return (index ? ' ' : '') + run
          }).join('')
          if(line.some(t=>t.style==='highlight')) {
            out.push('<text x="' + x + '" y="' + (y+l.heading.size*k) + '" font-family="' + esc(s.headFont) + '" font-size="' + l.heading.size*k + '" font-weight="' + s.headWeight + '" text-anchor="' + anchor(s.align) + '">' + textRuns + '</text>')
          } else out.push('<text x="' + x + '" y="' + (y+l.heading.size*k) + '" font-family="' + esc(s.headFont) + '" font-size="' + l.heading.size*k + '" font-weight="' + s.headWeight + '" text-anchor="' + anchor(s.align) + '">' + textRuns + '</text>')
          void cursorX
          void wholeLine
        }
      })
      l.body.lines.forEach((line,i)=>out.push('<text x="' + l.body.x*k + '" y="' + (l.body.y+i*l.body.lineHeight+l.body.size)*k + '" fill="' + esc(s.textColor) + '" font-family="' + esc(s.bodyFont) + '" font-size="' + l.body.size*k + '" font-weight="' + s.bodyWeight + '" text-anchor="' + anchor(s.align) + '">' + esc(line) + '</text>'))
    }
    if (layer === 'logo' && s.logoImage) {
      const lw=W*s.logoSize,lh=lw*.4,p=logoPosition(s.logoPos,W,H,lw,lh)
      out.push('<image href="' + esc(s.logoImage) + '" x="' + p.x + '" y="' + p.y + '" width="' + lw + '" height="' + lh + '" preserveAspectRatio="xMidYMid meet"/>')
    }
    if (layer === 'signature' && s.signature) out.push('<text x="' + W*.05 + '" y="' + (H*.9+24*k) + '" fill="' + esc(s.textColor) + '" font-family="' + esc(s.bodyFont) + '" font-size="' + 24*k + '">' + esc(s.signature) + '</text>')
    if (layer === 'swipeHint' && s.swipeHint) out.push('<text x="' + W*.95 + '" y="' + (H*.94+18*k) + '" fill="' + esc(s.textColor) + '" font-family="' + esc(s.bodyFont) + '" font-size="' + 18*k + '" font-weight="700" text-anchor="end">SWIPE →</text>')
  }
  out.push('</svg>')
  return out.join('')
}
