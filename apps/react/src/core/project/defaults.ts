import type { Project, Slide } from './schema'
export const defaultSlide = (id: string): Slide => ({
  id, background: '#F2EDE3', layout: 'fullbleed', heading: '', body: '', kicker: '', textColor: '#171717',
  image: null, imageScale: 1, imageOffsetX: 0.5, imageOffsetY: 0.5, imageInset: 0, imageRadius: 0,
  layer2Image: null, layer2Scale: 1, layer2OffsetX: 0.5, layer2OffsetY: 0.5, layer2Opacity: 60, layer2Blend: 'normal',
  overlayDirection: 'bottom', overlayOpacity: 55, overlayColor: '#000000', position: 'center', align: 'left',
  textOffsetX: 0, textOffsetY: 0, textBoxWRatio: 1, textBoxHRatio: 1, bodyDetached: false, tscale: 1, bodyTscale: 1,
  headFont: 'Playfair Display', headWeight: 800, bodyFont: 'Inter', bodyWeight: 400, logoImage: null, logoSize: 0.16,
  logoPos: 'tl', signature: null, cutoutImage: null, swipeHint: false, textLayers: [], layerOrder: [], layerHidden: {}, animation: {},
})
export const createDefaultProject = (): Project => ({
  schemaVersion: 1, id: crypto.randomUUID(), name: 'Untitled Carousel', aspect: 'portrait',
  slides: [defaultSlide(crypto.randomUUID())], typography: {}, theme: {}, settings: {}, metadata: { source: 'react-01.2.2', goldenMaster: 'v52' },
})
