import { useEffect, useRef, useState } from 'react'
import Certificate from './Certificate'
import './Coa.css'

const BACKGROUND = encodeURI('/COA/bg.png')
const DOCTOR = encodeURI('/COA/Female doctor.png')
const ICON_PETRI = encodeURI('/COA/magnific_create-a-minimal-ultrarea_w4zVBdw7EI 1.png')
const ICON_DISH = encodeURI('/COA/magnific_create-a-minimal-premium-_w4zMMzs7EI 1.png')
const ICON_MOLECULE = encodeURI('/COA/magnific_create-a-minimal-premium-_ov5sj7F829 1.png')

const TESTS = [
  {
    title: 'Peptide content',
    copy: 'Confirms the stated peptide mass per vial.',
    icon: ICON_MOLECULE,
    iw: 175,
    ih: 138,
  },
  {
    title: 'Residual solvents',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_PETRI,
    iw: 181,
    ih: 138,
  },
  {
    title: 'Heavy metals',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_DISH,
    iw: 137,
    ih: 137,
  },
  {
    title: 'Endotoxin',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_DISH,
    iw: 137,
    ih: 137,
  },
  {
    title: 'Mass Spectrometry',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_MOLECULE,
    iw: 175,
    ih: 138,
  },
]

/* Four identical sets: the marquee shifts by -50% (two sets) so the wrap is
   seamless and the remaining two sets always cover the viewport. */
const CARD_SETS = 4

const HEADLINE_LINES = [
  ['Built', 'for', 'Scrutiny.', 'A', 'Robust'],
  ['Certificate', 'of', 'Analysis.'],
]

const LEDE_WORDS = [
  'Every',
  'research',
  'product',
  'undergoes',
  'an',
  'intensive',
  'testing',
  'panel',
  'that',
  'you',
  'can',
  'view',
  'so',
  'you',
  'can',
  'have',
  'peace',
  'of',
  'mind.',
]

const HEADLINE_COUNT = HEADLINE_LINES.flat().length
const LEDE_COUNT = LEDE_WORDS.length

/* Title fills first, then the lede. Overlapping slices so the next word can
   start its short opacity ease before the previous one has fully settled. */
const HEADLINE_WINDOW = [0, 0.58]
const LEDE_WINDOW = [0.6, 1]

/* Section top at 94vh → 0 words; top at 22vh → all words. Bidirectional:
   scrolling up raises the top again and un-reveals last-to-first. */
const COPY_START_VIEW = 0.94
const COPY_END_VIEW = 0.22
const COPY_LERP = 0.26
const PROGRESS_SNAP = 0.00035

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const sliceThresholds = (count, start, end, overlap = 0.32) => {
  const span = end - start
  return Array.from({ length: count }, (_, i) =>
    start + ((i + 1 - overlap) / count) * span,
  )
}

const WORD_ON = [
  ...sliceThresholds(HEADLINE_COUNT, HEADLINE_WINDOW[0], HEADLINE_WINDOW[1]),
  ...sliceThresholds(LEDE_COUNT, LEDE_WINDOW[0], LEDE_WINDOW[1]),
]

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value)

function WordLine({ words, from = 0 }) {
  return words.map((word, i) => (
    <span className="coa__word" data-word={from + i} key={from + i}>
      {word}
    </span>
  ))
}

function TestCard({ test, clone }) {
  return (
    <li
      className={clone ? 'coa__card coa__card--clone' : 'coa__card'}
      aria-hidden={clone || undefined}
    >
      <h3>{test.title}</h3>
      <img
        className="coa__card-icon"
        src={test.icon}
        alt=""
        width={test.iw}
        height={test.ih}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />
      <p>{test.copy}</p>
    </li>
  )
}

export default function Coa() {
  const sectionRef = useRef(null)
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches,
  )

  useEffect(() => {
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY)
    const syncMotion = () => setReduced(motionQuery.matches)
    motionQuery.addEventListener('change', syncMotion)
    return () => motionQuery.removeEventListener('change', syncMotion)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const wordNodes = section.querySelectorAll('[data-word]')
    let lastOn = -1

    const syncCopy = (copy) => {
      section.dataset.copy = copy.toFixed(4)
      let on = 0
      for (let i = 0; i < WORD_ON.length; i += 1) {
        if (copy >= WORD_ON[i]) on += 1
        else break
      }
      if (on === lastOn) return
      lastOn = on
      wordNodes.forEach((node) => {
        const i = Number(node.dataset.word)
        node.classList.toggle('coa__word--on', i < on)
      })
    }

    if (reduced) {
      syncCopy(1)
      return undefined
    }

    const copyProgress = () => {
      const rect = section.getBoundingClientRect()
      const viewport = window.innerHeight
      const start = viewport * COPY_START_VIEW
      const end = viewport * COPY_END_VIEW
      const travel = start - end
      return travel > 0 ? clamp01((start - rect.top) / travel) : 1
    }

    let rafId = 0
    let displayCopy = 0
    let haveDisplay = false

    const lerpToward = (current, target, factor) => {
      const next = current + (target - current) * factor
      return Math.abs(target - next) < PROGRESS_SNAP ? target : next
    }

    const tick = () => {
      rafId = window.requestAnimationFrame(tick)
      const target = copyProgress()
      if (!haveDisplay) {
        displayCopy = target
        haveDisplay = true
      } else {
        displayCopy = lerpToward(displayCopy, target, COPY_LERP)
      }
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
          if (entry.isIntersecting) {
            startLoop()
          } else {
            stopLoop()
            haveDisplay = false
            syncCopy(copyProgress())
          }
        }
      },
      { rootMargin: '25% 0px' },
    )
    observer.observe(section)
    syncCopy(copyProgress())

    return () => {
      stopLoop()
      observer.disconnect()
    }
  }, [reduced])

  return (
    <section
      className={`coa${reduced ? ' coa--still' : ''}`}
      id="testing"
      ref={sectionRef}
    >
      <img
        className="coa__bg"
        src={BACKGROUND}
        alt=""
        aria-hidden="true"
        width={1896}
        height={980}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />

      <div className="coa__intro">
        <h2 className="coa__headline" aria-label="Built for Scrutiny. A Robust Certificate of Analysis.">
          {HEADLINE_LINES.map((words, line) => (
            <span className="coa__line" key={line}>
              <WordLine
                words={words}
                from={HEADLINE_LINES.slice(0, line).flat().length}
              />
            </span>
          ))}
        </h2>
        <p className="coa__lede" aria-label="Every research product undergoes an intensive testing panel that you can view so you can have peace of mind.">
          <WordLine words={LEDE_WORDS} from={HEADLINE_COUNT} />
        </p>
      </div>

      <div className="coa__stage">
        <div className="coa__marquee">
          <ul className="coa__cards">
            {Array.from({ length: CARD_SETS }, (_, set) =>
              TESTS.map((test) => (
                <TestCard test={test} clone={set > 0} key={`${test.title}-${set}`} />
              )),
            )}
          </ul>
        </div>

        <div className="coa__doc">
          <Certificate />
        </div>

        <img
          className="coa__doctor"
          src={DOCTOR}
          alt="Clinician reviewing research peptide quality"
          width={751}
          height={686}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      </div>
    </section>
  )
}
