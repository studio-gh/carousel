import { describe, expect, it } from 'vitest'
import { buildTextLayout } from '../src/core/typography/layout'
import { buildRenderScene } from '../src/core/render/contract'
import { buildSlideSVG } from '../src/core/render/svg/renderer'
import { createDefaultProject } from '../src/core/project/defaults'

function fakeContext() {
  let fontSize = 100
  return {
    set font(value: string) { const match = value.match(/(\\d+(?:\\.\\d+)?)px/); if (match) fontSize = Number(match[1]) },
    get font() { return '800 ' + fontSize + 'px Playfair Display' },
    measureText(text: string) { return { width: text.length * fontSize * .52 } },
  } as unknown as CanvasRenderingContext2D
}

describe('Renderer and typography regression gates', () => {
  it('builds SVG with expected output size and retained layout geometry', () => {
    const slide = {...createDefaultProject().slides[0],layout:'columnasym' as const,image:'data:image/png;base64,AA==',heading:'Hello',body:'World'}
    const ctx = fakeContext()
    const textLayout = buildTextLayout(ctx,slide,{x:0,y:0,w:1080,h:1350},1080,1350,{heading:{family:'Playfair Display',weight:800},body:{family:'Inter',weight:400}})
    const scene = buildRenderScene(slide,1080,1350,1080,textLayout)
    const svg = buildSlideSVG(scene)
    expect(svg).toContain('width="1080" height="1350"')
    expect(scene.geometry.image.w).toBeCloseTo(1080 * .62)
    expect(svg).toContain('Hello')
    expect(svg).toContain('World')
  })
  it('respects canonical layer visibility', () => {
    const slide = {...createDefaultProject().slides[0],heading:'Hidden headline',layerHidden:{text:true}}
    const ctx = fakeContext()
    const textLayout = buildTextLayout(ctx,slide,{x:0,y:0,w:1080,h:1350},1080,1350,{heading:{family:'Playfair Display',weight:800},body:{family:'Inter',weight:400}})
    const scene = buildRenderScene(slide,1080,1350,1080,textLayout)
    expect(buildSlideSVG(scene)).not.toContain('Hidden headline')
  })
  it('keeps the reported headline split into a canonical set of lines', () => {
    const slide = {...createDefaultProject().slides[0],heading:'Agora imagina sem ~lesões~',body:'',textBoxWRatio:.72,textBoxHRatio:1,position:'bottom' as const,align:'left' as const}
    const layout = buildTextLayout(fakeContext(),slide,{x:0,y:0,w:1080,h:1350},1080,1350,{heading:{family:'Playfair Display',weight:800},body:{family:'Inter',weight:400}})
    expect(layout.heading.lines.length).toBeGreaterThan(1)
    expect(layout.heading.lines.flat().map(token=>token.text).join(' ')).toBe('Agora imagina sem lesões')
    expect(layout.scale).toBeGreaterThan(.3)
  })
})
