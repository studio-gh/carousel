import { describe, expect, it } from 'vitest'
import { computeSlideGeometry } from '../src/core/geometry/getBoxes'
import { computeImageBox, offScale } from '../src/core/geometry/image'
import { logoPosition } from '../src/core/geometry/logo'
import { createDefaultProject } from '../src/core/project/defaults'
import { ProjectSchema } from '../src/core/project/schema'
import { deserializeProject, serializeProject } from '../src/core/project/serialization'

const W = 1080, H = 1350
function expectBox(box: any, x: number, y: number, w: number, h: number) {
  expect(box.x).toBeCloseTo(x); expect(box.y).toBeCloseTo(y); expect(box.w).toBeCloseTo(w); expect(box.h).toBeCloseTo(h)
}

describe('Carousel Core foundation', () => {
  it('creates a valid default project', () => {
    const project = createDefaultProject()
    expect(ProjectSchema.parse(project)).toEqual(project)
    expect(project.slides).toHaveLength(1)
    expect(project.metadata.goldenMaster).toBe('v52')
  })
  it('preserves geometry for retained layouts', () => {
    const s = createDefaultProject().slides[0]
    expectBox(computeSlideGeometry({...s,layout:'fullbleed'},W,H).image,0,0,W,H)
    expectBox(computeSlideGeometry({...s,layout:'imageleft'},W,H).image,0,0,W/2,H)
    expectBox(computeSlideGeometry({...s,layout:'imageright'},W,H).image,W/2,0,W/2,H)
    expectBox(computeSlideGeometry({...s,layout:'imagetop'},W,H).image,0,0,W,H/2)
    expectBox(computeSlideGeometry({...s,layout:'imagebottom'},W,H).image,0,H/2,W,H/2)
    expectBox(computeSlideGeometry({...s,layout:'goldencanon'},W,H).image,0,0,W,H*.618)
    expectBox(computeSlideGeometry({...s,layout:'columnasym'},W,H).image,0,0,W*.62,H)
  })
  it('uses the shared cover image math', () => {
    const result = computeImageBox(2000,1000,540,1350,1,.5,.5)
    expect(result.dw).toBeCloseTo(2700); expect(result.dh).toBeCloseTo(1350)
    expect(result.left).toBeCloseTo(-1080); expect(result.top).toBeCloseTo(0)
  })
  it('keeps coordinate scaling and logo placement deterministic', () => {
    expect(offScale(540,1080)).toBeCloseTo(.5)
    expect(offScale(1080,1080)).toBeCloseTo(1)
    expect(logoPosition('tl',W,H,100,50)).toEqual({x:54,y:54})
  })
  it('round-trips a saved project', () => {
    const original = createDefaultProject()
    const loaded = deserializeProject(serializeProject(original))
    expect(loaded).toEqual(original)
  })
})
