import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { createDefaultProject } from '../core/project/defaults'
import { buildRenderScene } from '../core/render/contract'
import { renderSceneToCanvas } from '../core/render/canvas/renderer'
import { buildSlideSVG } from '../core/render/svg/renderer'
import { serializeProject, deserializeProject } from '../core/project/serialization'
import type { Layout, Project } from '../core/project/schema'
import type { StyledToken } from '../core/typography/layout'

const layouts: Array<[Layout, string]> = [
  ['fullbleed', 'Full bleed'],
  ['imageleft', 'Image à esquerda'],
  ['imageright', 'Image à direita'],
  ['imagetop', 'Image no topo'],
  ['imagebottom', 'Image embaixo'],
  ['editorial', 'Editorial'],
  ['columnasym', 'Coluna assimétrica'],
  ['goldencanon', 'Cânone áureo'],
  ['axial', 'Axial'],
]

function contrastTextColor(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#FAFAF9'
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > .55 ? '#14161A' : '#FAFAF9'
}

function StyledLine({ line, color, accent }: { line: StyledToken[]; color: string; accent: string }) {
  return <>{line.map((token, index) => {
    const style = token.style === 'highlight'
      ? { backgroundColor: accent, color: contrastTextColor(accent), padding: '0 .08em', boxDecorationBreak: 'clone' as const, WebkitBoxDecorationBreak: 'clone' as const }
      : token.style === 'accent' ? { color: accent }
      : token.style === 'outline' ? { color: 'transparent', WebkitTextStroke: '1px ' + color }
      : { color }
    return <span key={index} style={style}>{index ? ' ' : ''}{token.text}</span>
  })}</>
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function App() {
  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem('carousel-studio-react-project')
      return saved ? deserializeProject(saved) : createDefaultProject()
    } catch {
      return createDefaultProject()
    }
  })
  const [exporting, setExporting] = useState(false)
  const [status, setStatus] = useState('Salvo localmente neste navegador')
  const [activePanel, setActivePanel] = useState<'text' | 'image' | 'layout'>('text')
  const [showSafeZone, setShowSafeZone] = useState(false)
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const slide = project.slides[0]
  const scene = useMemo(() => buildRenderScene(slide, 1080, 1350, 1080), [slide])

  useEffect(() => {
    try {
      localStorage.setItem('carousel-studio-react-project', serializeProject(project))
      setStatus('Salvo localmente neste navegador')
    } catch {
      setStatus('Não foi possível salvar automaticamente')
    }
  }, [project])

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      if (editorCanvasRef.current) await renderSceneToCanvas(editorCanvasRef.current, scene, { includeText: false })
      if (exportCanvasRef.current) await renderSceneToCanvas(exportCanvasRef.current, scene)
      if (!cancelled) setStatus('Prévia atualizada')
    }
    void render().catch(() => { if (!cancelled) setStatus('Falha ao atualizar a prévia') })
    return () => { cancelled = true }
  }, [scene])

  const updateSlide = (patch: Partial<typeof slide>) => setProject(current => ({
    ...current,
    slides: current.slides.map((item, index) => index === 0 ? { ...item, ...patch } : item),
  }))

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setStatus('Escolha um arquivo de imagem.'); return }
    if (file.size > 20 * 1024 * 1024) { setStatus('Imagem muito grande. Use um arquivo menor que 20 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateSlide({ image: reader.result })
        setStatus('Imagem carregada')
      }
    }
    reader.onerror = () => setStatus('Não foi possível carregar a imagem')
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const exportPng = async () => {
    setExporting(true); setStatus('Preparando PNG…')
    try {
      const canvas = document.createElement('canvas')
      await renderSceneToCanvas(canvas, scene, { pixelRatio: 1 })
      canvas.toBlob(blob => {
        if (blob) { downloadBlob(blob, 'carousel-studio-slide.png'); setStatus('PNG exportado') }
        else setStatus('Falha ao gerar PNG')
        setExporting(false)
      }, 'image/png')
    } catch {
      setStatus('Falha ao exportar PNG')
      setExporting(false)
    }
  }

  const exportSvg = () => {
    try {
      downloadBlob(new Blob([buildSlideSVG(scene)], { type: 'image/svg+xml;charset=utf-8' }), 'carousel-studio-slide.svg')
      setStatus('SVG exportado')
    } catch {
      setStatus('Falha ao exportar SVG')
    }
  }

  const exportProject = () => downloadBlob(new Blob([serializeProject(project)], { type: 'application/json;charset=utf-8' }), 'carousel-studio-project.json')
  const importProject = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try { setProject(deserializeProject(String(reader.result))); setStatus('Projeto importado') }
        catch { setStatus('Arquivo de projeto inválido') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const textLayout = scene.textLayout
  const activeWidth = 1080
  const activeHeight = 1350

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Carousel Studio">
        <span className="brand-mark">C</span>
        <span><strong>Carousel Studio</strong><small>EDITORIAL WORKSPACE</small></span>
      </a>
      <div className="topbar-project">
        <span className="project-title">{project.name}</span>
        <span className="save-status"><i />{status}</span>
      </div>
      <div className="topbar-actions">
        <button className="button button-quiet" onClick={importProject}>Abrir projeto</button>
        <button className="button button-quiet" onClick={exportProject}>Salvar JSON</button>
        <button className="button button-primary" disabled={exporting} onClick={() => void exportPng()}>{exporting ? 'Exportando…' : 'Exportar PNG'} <span aria-hidden>↗</span></button>
        <button className="button button-secondary" onClick={exportSvg}>SVG</button>
      </div>
    </header>

    <section className="workspace">
      <aside className="left-rail">
        <div className="rail-title"><span>PROJETO</span><button className="icon-button" title="Exportar projeto como JSON" onClick={exportProject}>↓</button></div>
        <div className="slide-card active">
          <div className="slide-number">01 <span>/ 01</span></div>
          <div className="slide-mini">
            {slide.image && <img src={slide.image} alt="" />}
            <div className="slide-mini-text">{slide.heading || 'Seu headline entra aqui'}</div>
          </div>
          <span className="slide-card-label">Capa</span>
        </div>
        <button className="add-slide" disabled title="Adição de slides será habilitada na próxima etapa">＋ <span>Adicionar slide</span></button>
        <div className="rail-bottom">
          <span className="status-dot" />
          <span>Projeto local<br/><small>Seus arquivos ficam neste navegador</small></span>
        </div>
      </aside>

      <section className="stage-column">
        <div className="stage-toolbar">
          <div className="stage-toolbar-group">
            <span className="section-eyebrow">CANVAS</span>
            <span className="stage-dimensions">1080 × 1350</span>
          </div>
          <div className="stage-toolbar-group">
            <label className="toggle-control"><input type="checkbox" checked={showSafeZone} onChange={e => setShowSafeZone(e.target.checked)} /><span>Safe zones</span></label>
            <span className="zoom-chip">100%</span>
          </div>
        </div>
        <div className="stage-area">
          <div className="stage-frame" style={{ aspectRatio: '4 / 5' }}>
            <canvas ref={editorCanvasRef} className="stage-background" aria-hidden="true" />
            {textLayout && <div className="dom-layer">
              {textLayout.kicker && <div className="dom-kicker" style={{ left: textLayout.kicker.x / activeWidth * 100 + '%', top: textLayout.kicker.y / activeHeight * 100 + '%', fontSize: textLayout.kicker.size / activeWidth * 100 + 'cqw', lineHeight: textLayout.kicker.lineHeight / activeWidth * 100 + 'cqw', color: slide.kickerColor || slide.textColor, fontFamily: slide.bodyFont }}>{textLayout.kicker.lines[0]}</div>}
              <div className="dom-heading" style={{ left: textLayout.heading.x / activeWidth * 100 + '%', top: textLayout.heading.y / activeHeight * 100 + '%', width: textLayout.availableWidth / activeWidth * 100 + '%', fontFamily: slide.headFont, fontWeight: slide.headWeight, fontSize: textLayout.heading.size / activeWidth * 100 + 'cqw', lineHeight: textLayout.heading.lineHeight / activeWidth * 100 + 'cqw', color: slide.textColor, textAlign: slide.align }}>
                {textLayout.heading.lines.map((line, index) => <div key={index} className="dom-text-line"><StyledLine line={line} color={slide.textColor} accent={slide.headAccentColor || '#FF5A36'} /></div>)}
              </div>
              {textLayout.body.lines.length > 0 && <div className="dom-body" style={{ left: textLayout.body.x / activeWidth * 100 + '%', top: textLayout.body.y / activeHeight * 100 + '%', width: textLayout.availableWidth / activeWidth * 100 + '%', fontFamily: slide.bodyFont, fontWeight: slide.bodyWeight, fontSize: textLayout.body.size / activeWidth * 100 + 'cqw', lineHeight: textLayout.body.lineHeight / activeWidth * 100 + 'cqw', color: slide.textColor, textAlign: slide.align }}>{textLayout.body.lines.map((line, index) => <div key={index} className="dom-text-line">{line}</div>)}</div>}
            </div>}
            {showSafeZone && <div className="safe-zone-overlay"><span>SAFE ZONE · EDITOR ONLY</span></div>}
          </div>
        </div>
        <div className="stage-footer"><span>PRÉVIA DO EDITOR</span><span>Canvas exportado usa o mesmo estado do projeto</span></div>
      </section>

      <aside className="inspector">
        <div className="inspector-heading"><span>INSPECTOR</span><span className="inspector-count">01 / 01</span></div>
        <div className="inspector-tabs" role="tablist" aria-label="Editor tools">
          <button className={activePanel === 'text' ? 'active' : ''} onClick={() => setActivePanel('text')}>Texto</button>
          <button className={activePanel === 'image' ? 'active' : ''} onClick={() => setActivePanel('image')}>Imagem</button>
          <button className={activePanel === 'layout' ? 'active' : ''} onClick={() => setActivePanel('layout')}>Layout</button>
        </div>

        {activePanel === 'text' && <div className="inspector-content">
          <label className="field-label" htmlFor="slide-heading">Headline</label>
          <textarea id="slide-heading" rows={4} value={slide.heading} onChange={e => updateSlide({ heading: e.target.value })} placeholder="Escreva a ideia principal…" />
          <div className="field-help">Use *texto* para destacar na cor de acento, _texto_ para contorno e ~texto~ para marca-texto.</div>
          <label className="field-label" htmlFor="slide-body">Texto de apoio</label>
          <textarea id="slide-body" rows={4} value={slide.body} onChange={e => updateSlide({ body: e.target.value })} placeholder="Contexto, pontos-chave ou explicação…" />
          <label className="field-label" htmlFor="slide-kicker">Kicker</label>
          <input id="slide-kicker" value={slide.kicker} onChange={e => updateSlide({ kicker: e.target.value })} placeholder="EX.: DESIGN / CULTURA / IDEIAS" />
          <div className="form-row">
            <div><label className="field-label" htmlFor="text-align">Alinhamento</label><select id="text-align" value={slide.align} onChange={e => updateSlide({ align: e.target.value as typeof slide.align })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></div>
            <div><label className="field-label" htmlFor="text-position">Posição</label><select id="text-position" value={slide.position} onChange={e => updateSlide({ position: e.target.value as typeof slide.position })}><option value="top">Topo</option><option value="center">Centro</option><option value="bottom">Base</option></select></div>
          </div>
          <div className="form-row">
            <div><label className="field-label" htmlFor="heading-color">Cor do texto</label><input id="heading-color" type="color" value={slide.textColor} onChange={e => updateSlide({ textColor: e.target.value })} /></div>
            <div><label className="field-label" htmlFor="accent-color">Destaque</label><input id="accent-color" type="color" value={slide.headAccentColor || '#FF5A36'} onChange={e => updateSlide({ headAccentColor: e.target.value })} /></div>
          </div>
          <label className="field-label" htmlFor="heading-font">Tipografia do título</label>
          <select id="heading-font" value={slide.headFont} onChange={e => updateSlide({ headFont: e.target.value })}><option>Playfair Display</option><option>Inter</option><option>Space Grotesk</option><option>DM Sans</option></select>
          <label className="field-label" htmlFor="heading-weight">Peso do título · {slide.headWeight}</label>
          <input id="heading-weight" type="range" min="400" max="900" step="100" value={slide.headWeight} onChange={e => updateSlide({ headWeight: Number(e.target.value) })} />
        </div>}

        {activePanel === 'image' && <div className="inspector-content">
          <label className="field-label">Imagem principal</label>
          <button className="upload-zone" onClick={() => fileInputRef.current?.click()}><span className="upload-icon">＋</span><strong>{slide.image ? 'Trocar imagem' : 'Adicionar imagem'}</strong><small>PNG, JPG ou WebP · até 20 MB</small></button>
          <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" onChange={handleImage} />
          {slide.image && <button className="button button-danger full-width" onClick={() => updateSlide({ image: null })}>Remover imagem</button>}
          <label className="field-label" htmlFor="image-scale">Zoom da imagem · {slide.imageScale.toFixed(2)}×</label>
          <input id="image-scale" type="range" min="1" max="3" step=".05" value={slide.imageScale} onChange={e => updateSlide({ imageScale: Number(e.target.value) })} />
          <label className="field-label" htmlFor="image-x">Posição horizontal · {Math.round(slide.imageOffsetX * 100)}%</label>
          <input id="image-x" type="range" min="0" max="1" step=".01" value={slide.imageOffsetX} onChange={e => updateSlide({ imageOffsetX: Number(e.target.value) })} />
          <label className="field-label" htmlFor="image-y">Posição vertical · {Math.round(slide.imageOffsetY * 100)}%</label>
          <input id="image-y" type="range" min="0" max="1" step=".01" value={slide.imageOffsetY} onChange={e => updateSlide({ imageOffsetY: Number(e.target.value) })} />
          <label className="field-label" htmlFor="image-radius">Cantos arredondados · {Math.round(slide.imageRadius * 100)}%</label>
          <input id="image-radius" type="range" min="0" max=".06" step=".005" value={slide.imageRadius} onChange={e => updateSlide({ imageRadius: Number(e.target.value) })} />
        </div>}

        {activePanel === 'layout' && <div className="inspector-content">
          <label className="field-label">Estrutura do slide</label>
          <div className="layout-grid">{layouts.map(([id, label]) => <button key={id} className={slide.layout === id ? 'selected' : ''} onClick={() => updateSlide({ layout: id })}><span className={'layout-icon layout-' + id}><i /></span><span>{label}</span></button>)}</div>
          <label className="field-label" htmlFor="background-color">Cor do fundo</label>
          <input id="background-color" type="color" value={slide.background} onChange={e => updateSlide({ background: e.target.value })} />
          <label className="field-label" htmlFor="overlay-opacity">Overlay · {slide.overlayOpacity}%</label>
          <input id="overlay-opacity" type="range" min="0" max="100" step="1" value={slide.overlayOpacity} onChange={e => updateSlide({ overlayOpacity: Number(e.target.value) })} />
        </div>}

        <div className="inspector-bottom"><span className="tiny-check">✓</span><span>Salvamento automático local<br /><small>Conta e sincronização ainda não estão ativadas.</small></span></div>
      </aside>
    </section>

    <div className="mobile-actions">
      <button onClick={() => setActivePanel('text')}>Texto</button>
      <button onClick={() => setActivePanel('image')}>Imagem</button>
      <button onClick={() => setActivePanel('layout')}>Layout</button>
      <button className="mobile-export" disabled={exporting} onClick={() => void exportPng()}>Exportar</button>
    </div>
    <div className="export-mirror" aria-hidden="true"><canvas ref={exportCanvasRef} /></div>
  </main>
}
