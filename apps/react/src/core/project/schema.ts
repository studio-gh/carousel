import { z } from 'zod'

export const AspectSchema = z.enum(['portrait', 'square', 'story'])
export const LayoutSchema = z.enum(['fullbleed','imageleft','imageright','imagetop','imagebottom','editorial','columnasym','goldencanon','axial'])
export const TextLayerSchema = z.object({
  id: z.string(), text: z.string().default(''), offsetX: z.number().default(0), offsetY: z.number().default(0),
  boxWRatio: z.number().default(0.84), boxHRatio: z.number().default(0.34), fontSizePx: z.number().optional(),
  align: z.enum(['left','center','right']).default('left'), fontFamily: z.string().optional(), fontWeight: z.number().optional(), color: z.string().optional(),
})
export const SlideSchema = z.object({
  id: z.string(), background: z.string().default('#F2EDE3'), layout: LayoutSchema.default('fullbleed'),
  heading: z.string().default(''), body: z.string().default(''), kicker: z.string().default(''), textColor: z.string().default('#171717'),
  image: z.string().nullable().default(null), imageScale: z.number().default(1), imageOffsetX: z.number().default(0.5), imageOffsetY: z.number().default(0.5),
  imageInset: z.number().default(0), imageRadius: z.number().default(0), layer2Image: z.string().nullable().default(null),
  layer2Scale: z.number().default(1), layer2OffsetX: z.number().default(0.5), layer2OffsetY: z.number().default(0.5),
  layer2Opacity: z.number().default(60), layer2Blend: z.string().default('normal'), overlayDirection: z.string().default('bottom'),
  overlayOpacity: z.number().default(55), overlayColor: z.string().default('#000000'), kickerColor: z.string().optional(), headAccentColor: z.string().optional(),
  position: z.enum(['top','center','bottom']).default('center'), align: z.enum(['left','center','right']).default('left'),
  textOffsetX: z.number().default(0), textOffsetY: z.number().default(0), textBoxWRatio: z.number().default(1), textBoxHRatio: z.number().default(1),
  bodyDetached: z.boolean().default(false), headSizePx: z.number().optional(), bodySizePx: z.number().optional(),
  tscale: z.number().default(1), bodyTscale: z.number().default(1), headFont: z.string().default('Playfair Display'), headWeight: z.number().default(800),
  bodyFont: z.string().default('Inter'), bodyWeight: z.number().default(400), logoImage: z.string().nullable().default(null),
  logoSize: z.number().default(0.16), logoPos: z.enum(['tl','tr','bl','br','top','bottom','center']).default('tl'),
  signature: z.string().nullable().default(null), cutoutImage: z.string().nullable().default(null), swipeHint: z.boolean().default(false),
  textLayers: z.array(TextLayerSchema).default([]), layerOrder: z.array(z.string()).default([]), layerHidden: z.record(z.string(), z.boolean()).default({}),
  animation: z.record(z.string(), z.any()).default({}),
})
export const ProjectSchema = z.object({
  schemaVersion: z.number().default(1), id: z.string(), name: z.string().default('Untitled Carousel'),
  aspect: AspectSchema.default('portrait'), slides: z.array(SlideSchema), typography: z.record(z.string(), z.any()).default({}),
  theme: z.record(z.string(), z.any()).default({}), settings: z.record(z.string(), z.any()).default({}), metadata: z.record(z.string(), z.any()).default({}),
})
export type Layout = 'fullbleed'|'imageleft'|'imageright'|'imagetop'|'imagebottom'|'editorial'|'columnasym'|'goldencanon'|'axial'
export type TextLayer = z.infer<typeof TextLayerSchema>
export type Slide = z.infer<typeof SlideSchema>
export type Project = z.infer<typeof ProjectSchema>
