import { useEffect, useRef, useState } from 'react'
import './Vials.css'

const CREST = encodeURI('/vials/USA Crest.png')

const CONTAMINANTS = [
  { label: 'Heavy metals', tone: 'metal' },
  { label: 'Toxins', tone: 'toxin' },
  { label: 'Impurities', tone: 'impurity' },
]

const LEAD_LINES = [
  ['Even', 'The', 'Vials', 'Are'],
  ['Manufactured'],
  ['in', 'the', 'USA'],
]

const SUB_LINES = [
  ['Ensuring', 'No'],
  ['Contamination'],
]

const LEAD_WORD_COUNT = LEAD_LINES.flat().length
const SUB_WORD_COUNT = SUB_LINES.flat().length
const LABEL_COUNT = CONTAMINANTS.length

const FRAME_COUNT = 91

/* Phase A: heading + contaminant row stay in the sticky stage so the
   section's overflow:clip + radius slice both as the rounded card leaves.
   Never `position: fixed` — a viewport dock paints over System.
   Phase B: copy still appears word-by-word from a 0–1 story — no band rise
   or band fade. Each word eases opacity in place; lead plays on enter /
   early scrub, then the band labels on the pin. */

/* Desktop copy: approach 0.16→1.00 fills the lead window (copy 0→0.52).
   Pin scrub 0→0.48 fills the rest (copy 0.52→1) so sub + labels are not
   dumped in one flick. Compact maps the section crossing the viewport
   onto the same 0–1 story. */
const COPY_APPROACH_START = 0.16
const COPY_APPROACH_SHARE = 0.52
const COPY_SCRUB_END = 0.48
const COPY_COMPACT_VIEW = 0.92
const COPY_COMPACT_TRAVEL_SECTION = 0.95
const COPY_COMPACT_TRAVEL_VIEW = 0.32

/* Overlapping windows so the next word can start its 150ms ease before
   the previous slice would have clicked off:
   lead   0.00–0.52   Even … USA
   sub    0.54–0.80   Ensuring / No / Contamination
   labels 0.81–1.00   Heavy metals / Toxins / Impurities */
const LEAD_WINDOW = [0, 0.52]
const SUB_WINDOW = [0.54, 0.8]
const LABEL_WINDOW = [0.81, 1]

/* Scroll jitter is lerped out; frame index never jumps more than this
   per rAF tick so a flick cannot skip a third of the sequence. */
const FRAME_LERP = 0.16
const COPY_LERP = 0.18
const PROGRESS_SNAP = 0.00035
const MAX_FRAME_STEP = 2

const sliceThresholds = (count, start, end, overlap = 0.32) => {
  const span = end - start
  return Array.from({ length: count }, (_, i) =>
    start + ((i + 1 - overlap) / count) * span,
  )
}

const WORD_ON = [
  ...sliceThresholds(LEAD_WORD_COUNT, LEAD_WINDOW[0], LEAD_WINDOW[1]),
  ...sliceThresholds(SUB_WORD_COUNT, SUB_WINDOW[0], SUB_WINDOW[1]),
  ...sliceThresholds(LABEL_COUNT, LABEL_WINDOW[0], LABEL_WINDOW[1]),
]

/* Must stay in step with the `max-width: 900px` breakpoint in Vials.css: below
   it the stage stops being sticky and the section falls back to a stacked
   layout, which changes both the artwork size and the scroll maths. */
const COMPACT_QUERY = '(max-width: 900px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const framePath = (index, compact) =>
  `/vials/${compact ? 'frames-sm' : 'frames'}/vial-${String(index + 1).padStart(4, '0')}.webp`

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value)

const smoothstep = (start, end, value) => {
  const t = clamp01((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

function WordLines({ lines, from = 0 }) {
  let index = from
  return lines.map((words, line) => (
    <span className="vials__line" key={line}>
      {words.map((word) => {
        const wordIndex = index
        index += 1
        return (
          <span className="vials__word" data-word={wordIndex} key={wordIndex}>
            {word}
          </span>
        )
      })}
    </span>
  ))
}

/* Coarse to fine. The first and last frames come first so the two positions a
   reader is most likely to stop on are never a stand-in, then progressively
   halving strides fill the arc in, which means a partly-loaded sequence is
   evenly spread rather than complete at the front and empty at the back. */
function loadOrder(count) {
  const order = [0, count - 1]
  const queued = new Set(order)
  for (const stride of [8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) {
      if (!queued.has(i)) {
        queued.add(i)
        order.push(i)
      }
    }
  }
  return order
}

export default function Vials() {
  const sectionRef = useRef(null)
  const mediaRef = useRef(null)
  const canvasRef = useRef(null)

  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches,
  )
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches,
  )
  const [painted, setPainted] = useState(false)

  useEffect(() => {
    const compactQuery = window.matchMedia(COMPACT_QUERY)
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    const syncCompact = () => setCompact(compactQuery.matches)
    const syncMotion = () => setReduced(motionQuery.matches)
    compactQuery.addEventListener('change', syncCompact)
    motionQuery.addEventListener('change', syncMotion)
    return () => {
      compactQuery.removeEventListener('change', syncCompact)
      motionQuery.removeEventListener('change', syncMotion)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const wordNodes = section.querySelectorAll('[data-word]')
    let lastCopyBits = -1

    const syncCopy = (copy) => {
      section.dataset.copy = copy.toFixed(4)
      let bits = 0
      for (let i = 0; i < WORD_ON.length; i += 1) {
        if (copy >= WORD_ON[i]) bits |= 1 << i
      }
      if (bits === lastCopyBits) return
      lastCopyBits = bits
      wordNodes.forEach((node) => {
        const i = Number(node.dataset.word)
        node.classList.toggle('vials__word--on', (bits & (1 << i)) !== 0)
      })
    }

    /* Reduced motion keeps the poster <img> and never builds the sequence, so
       the section costs one frame instead of ninety-one. Words stay on via CSS. */
    if (reduced) {
      syncCopy(1)
      return undefined
    }

    const media = mediaRef.current
    const canvas = canvasRef.current
    if (!media || !canvas) return undefined

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return undefined
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    const frames = new Array(FRAME_COUNT).fill(null)
    let cancelled = false
    let rafId = 0
    let drawnIndex = -1
    let canvasWidth = 0
    let canvasHeight = 0
    let firstPaintDone = false
    let displayFrame = 0
    let displayCopy = 0
    let haveDisplay = false

    const nearestFrame = (index) => {
      if (frames[index]) return frames[index]
      for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
        if (frames[index - offset]) return frames[index - offset]
        if (frames[index + offset]) return frames[index + offset]
      }
      return null
    }

    /* Source is 4:3 but the stage is whatever shape the viewport is, so the
       draw rectangle reproduces `object-fit: cover` by hand: scale to the
       larger of the two ratios and centre the overflow. */
    const paint = (image) => {
      const cssWidth = media.clientWidth
      const cssHeight = media.clientHeight
      if (!image || !cssWidth || !cssHeight) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(cssWidth * dpr)
      const height = Math.round(cssHeight * dpr)
      if (width !== canvasWidth || height !== canvasHeight) {
        canvas.width = width
        canvas.height = height
        canvasWidth = width
        canvasHeight = height
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
      }

      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const drawWidth = image.naturalWidth * scale
      const drawHeight = image.naturalHeight * scale
      context.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      )

      if (!firstPaintDone) {
        firstPaintDone = true
        setPainted(true)
      }
    }

    const progress = () => {
      if (compact) {
        /* Stacked layout: the artwork is a normal block shorter than the
           viewport, so scrub it across the span where it is visible at all. */
        const rect = media.getBoundingClientRect()
        const viewport = window.innerHeight
        return clamp01((viewport - rect.top) / (viewport + rect.height))
      }
      /* Sticky layout: the stage is pinned, so the section's own remaining
         height is exactly the distance the reader has left to travel. */
      const rect = section.getBoundingClientRect()
      const travel = rect.height - media.getBoundingClientRect().height
      return travel > 0 ? clamp01(-rect.top / travel) : 0
    }

    const approach = () => {
      const rect = section.getBoundingClientRect()
      const viewport = window.innerHeight
      if (rect.top <= 0) return 1
      return viewport > 0 ? clamp01(1 - rect.top / viewport) : 1
    }

    const copyProgress = (p) => {
      if (compact) {
        const rect = section.getBoundingClientRect()
        const viewport = window.innerHeight
        const start = viewport * COPY_COMPACT_VIEW
        const travel = rect.height * COPY_COMPACT_TRAVEL_SECTION + viewport * COPY_COMPACT_TRAVEL_VIEW
        return smoothstep(0, 1, clamp01((start - rect.top) / travel))
      }
      const enter = smoothstep(
        COPY_APPROACH_START,
        1,
        approach(),
      )
      if (enter < 1) return enter * COPY_APPROACH_SHARE
      return COPY_APPROACH_SHARE + smoothstep(0, COPY_SCRUB_END, p) * (1 - COPY_APPROACH_SHARE)
    }

    const lerpToward = (current, target, factor) => {
      const next = current + (target - current) * factor
      return Math.abs(target - next) < PROGRESS_SNAP ? target : next
    }

    const band = section.querySelector('.vials__band')

    const syncBand = (p) => {
      section.dataset.progress = p.toFixed(4)

      if (!band || compact) return

      /* Band stays in the sticky stage (never `position: fixed`). Hide
         only once the card has left the viewport so it cannot paint on
         System; while Vials still intersects, overflow:clip cuts it. */
      const rect = section.getBoundingClientRect()
      const covering = rect.bottom > 0 && rect.top < window.innerHeight
      band.classList.toggle('vials__band--gone', !covering)
    }

    const tick = () => {
      rafId = window.requestAnimationFrame(tick)
      const raw = progress()
      const mapped = smoothstep(0, 1, raw)
      const copyTarget = copyProgress(raw)

      if (!haveDisplay) {
        displayFrame = mapped
        displayCopy = copyTarget
        haveDisplay = true
      } else {
        displayFrame = lerpToward(displayFrame, mapped, FRAME_LERP)
        displayCopy = lerpToward(displayCopy, copyTarget, COPY_LERP)
      }

      /* Covering-section hide uses live rects — only artwork + words lag. */
      syncBand(raw)
      syncCopy(displayCopy)

      let index = Math.round(displayFrame * (FRAME_COUNT - 1))
      if (drawnIndex >= 0) {
        const delta = index - drawnIndex
        if (Math.abs(delta) > MAX_FRAME_STEP) {
          index = drawnIndex + Math.sign(delta) * MAX_FRAME_STEP
          displayFrame = index / (FRAME_COUNT - 1)
        }
      }

      const image = nearestFrame(index)
      if (!image) return
      const resized = media.clientWidth * Math.min(window.devicePixelRatio || 1, 2)
      if (index === drawnIndex && Math.round(resized) === canvasWidth) return
      drawnIndex = index
      canvas.dataset.frame = String(index)
      paint(image)
    }

    const startLoop = () => {
      if (!rafId) rafId = window.requestAnimationFrame(tick)
    }
    const stopLoop = () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      rafId = 0
    }

    /* Six at a time: enough to keep the connection busy without the sequence
       starving the rest of the page of bandwidth while it is still off screen. */
    const runLoader = () => {
      const order = loadOrder(FRAME_COUNT)
      let cursor = 0
      const worker = async () => {
        while (!cancelled && cursor < order.length) {
          const index = order[cursor]
          cursor += 1
          const image = new Image()
          image.decoding = 'async'
          image.src = framePath(index, compact)
          try {
            await image.decode()
          } catch {
            /* Safari rejects decode() for images it has already cached oddly,
               and a failed frame should not stall the queue either way. */
            if (!image.complete || !image.naturalWidth) continue
          }
          if (cancelled) return
          frames[index] = image
          /* Force a repaint: the frame under the cursor may have been a
             stand-in from a neighbour until this one arrived. */
          drawnIndex = -1
        }
      }
      for (let i = 0; i < 6; i += 1) worker()
    }

    /* Nothing downloads until the section is within a screen or two, so a
       reader who never scrolls this far never pays for it. */
    let loaderStarted = false
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!loaderStarted) {
              loaderStarted = true
              runLoader()
            }
            startLoop()
          } else {
            stopLoop()
          }
        }
      },
      { rootMargin: '150% 0px' },
    )
    observer.observe(section)
    const boot = progress()
    syncBand(boot)
    syncCopy(copyProgress(boot))

    const resizeObserver = new ResizeObserver(() => {
      drawnIndex = -1
    })
    resizeObserver.observe(media)
    resizeObserver.observe(section)

    return () => {
      cancelled = true
      stopLoop()
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [compact, reduced])

  const posterIndex = reduced ? FRAME_COUNT - 1 : 0

  return (
    <section
      className={`vials${painted ? ' vials--painted' : ''}${reduced ? ' vials--still' : ''}`}
      id="packaging"
      ref={sectionRef}
    >
      <div className="vials__stage">
        <div className="vials__media" ref={mediaRef}>
          <canvas className="vials__canvas" ref={canvasRef} aria-hidden="true" />
          <img
            className="vials__poster"
            src={framePath(posterIndex, compact)}
            alt="Frontier presentation box beside a 10mg research vial"
          />
          <div className="vials__scrim" />
        </div>

        <img className="vials__crest" src={CREST} alt="" aria-hidden="true" />

        <h2 className="vials__lead">
          <WordLines lines={LEAD_LINES} />
        </h2>

        <div className="vials__band">
          <h3 className="vials__sub">
            <WordLines lines={SUB_LINES} from={LEAD_WORD_COUNT} />
          </h3>

          <ul className="vials__list">
            {CONTAMINANTS.map((item, i) => (
              <li
                className="vials__item"
                data-word={LEAD_WORD_COUNT + SUB_WORD_COUNT + i}
                key={item.label}
              >
                <span className={`vials__dot vials__dot--${item.tone}`} />
                <span className="vials__label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
