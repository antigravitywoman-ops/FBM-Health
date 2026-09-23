import { useEffect, useRef, useState } from 'react'
import './Vials.css'

const CREST = encodeURI('/vials/USA Crest.png')
const ART = '/vials/magnific_use-reference-image-1-img_IfreioWtvE.png'

const CONTAMINANTS = [
  { label: 'Heavy metals', src: '/vials/60cbc147d39a155e164cd7d41b00224768bd0d38.png' },
  { label: 'Toxins', src: '/vials/37ca1c52f6ee269255143ec02775e0c61fbf0ec3.png' },
  { label: 'Impurities', src: '/vials/1a94ee85e2f5be111a3fb2aded32ac7f12c9fd8f.png' },
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

/* Phase A: heading + contaminant row stay in the sticky stage so the
   section's overflow:clip + radius slice both as the rounded card leaves.
   Never `position: fixed` — a viewport dock paints over System.
   Phase B: copy still appears word-by-word from a 0–1 story — no band rise
   or band fade. Each word eases opacity in place; lead plays on enter,
   then the band labels while the still is pinned. */

/* Desktop copy: approach 0.16→1.00 fills the lead window (copy 0→0.52).
   The pin fills the rest (copy 0.52→1) so sub + labels are not dumped in
   one flick. Compact maps the section crossing the viewport onto the
   same 0–1 story. */
const COPY_APPROACH_START = 0.16
const COPY_APPROACH_SHARE = 0.52
const COPY_SCRUB_END = 1
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

const COPY_LERP = 0.18
const PROGRESS_SNAP = 0.00035

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

export default function Vials() {
  const sectionRef = useRef(null)
  const mediaRef = useRef(null)

  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches,
  )
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches,
  )

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

    if (reduced) {
      syncCopy(1)
      return undefined
    }

    const media = mediaRef.current
    if (!media) return undefined

    let rafId = 0
    let displayCopy = 0
    let haveDisplay = false
    let copyLatched = false

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
      const copyTarget = copyProgress(raw)

      /* Reveal only moves forward. Once every word is on, later scroll —
         including back up the page — cannot hide it again. */
      if (!copyLatched) {
        if (!haveDisplay) {
          displayCopy = copyTarget
          haveDisplay = true
        } else if (copyTarget > displayCopy) {
          displayCopy = lerpToward(displayCopy, copyTarget, COPY_LERP)
        }
        if (displayCopy >= 1 - PROGRESS_SNAP) {
          displayCopy = 1
          copyLatched = true
        }
      }

      syncBand(raw)
      syncCopy(displayCopy)
    }

    const startLoop = () => {
      if (!rafId) rafId = window.requestAnimationFrame(tick)
    }
    const stopLoop = () => {
      if (rafId) window.cancelAnimationFrame(rafId)
      rafId = 0
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) startLoop()
          else stopLoop()
        }
      },
      { rootMargin: '50% 0px' },
    )
    observer.observe(section)
    const boot = progress()
    syncBand(boot)
    syncCopy(copyProgress(boot))

    return () => {
      stopLoop()
      observer.disconnect()
    }
  }, [compact, reduced])

  return (
    <section
      className={`vials${reduced ? ' vials--still' : ''}`}
      id="packaging"
      ref={sectionRef}
    >
      <div className="vials__stage">
        <div className="vials__media" ref={mediaRef}>
          <img
            className="vials__poster"
            src={ART}
            alt="Open Frontier presentation box of 10mg research vials beside a single vial"
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
                <img className="vials__dot" src={item.src} alt="" />
                <span className="vials__label">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
