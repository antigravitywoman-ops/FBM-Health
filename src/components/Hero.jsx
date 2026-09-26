import { useEffect, useRef, useState } from 'react'
import './Hero.css'

const HERO_IMAGE = encodeURI(
  '/hero/magnific_reate-a-premium-elegant-p_4RcHwtz9Aa 1.png',
)
const HERO_POSTER = '/hero/hero-poster.jpg'
const HERO_VIDEO = '/hero/hero-loop.mp4'
const HERO_VIDEO_SMALL = '/hero/hero-loop-mobile.mp4'
const FLAG_IMAGE = encodeURI('/hero/USA_Flag 1.svg')
const LOGO_MARK = encodeURI('/logos/Frontier logotype primary.svg')

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

// Each variant is its own two lines so the headline always stays three lines tall.
const HEADLINES = [
  ['Peptides For Researcher', 'Confidence'],
  ['Peptides Backed By', 'Independent Testing'],
  ['Peptides Built On', 'Verified Purity'],
  ['Peptides Proven By', 'Full Traceability'],
]

const HEADLINE_INTERVAL = 4200

const NAV_LINKS = [
  { href: '#testing', label: 'Testing' },
  { href: '#process', label: 'Our Process' },
  { href: '#packaging', label: 'Packaging' },
  { href: '#support', label: 'Support System' },
]

const TRUST = [
  'Independent ISO/IEC 17025 accredited certification',
  'Lot-level traceability on all products',
  'USA Manufactured Vials',
]

function ArrowIcon() {
  return (
    <span className="hero__btn-icon" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8h10M9.5 4.5 13 8l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [headline, setHeadline] = useState(0)
  const [leaving, setLeaving] = useState(-1)
  const [flipArmed, setFlipArmed] = useState(false)
  const headlineRef = useRef(0)
  const videoRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia(REDUCED_MOTION)
    const arm = requestAnimationFrame(() => setFlipArmed(true))

    const timer = setInterval(() => {
      const current = headlineRef.current
      const next = (current + 1) % HEADLINES.length
      headlineRef.current = next
      setLeaving(reduce.matches ? -1 : current)
      setHeadline(next)
    }, HEADLINE_INTERVAL)

    return () => {
      cancelAnimationFrame(arm)
      clearInterval(timer)
    }
  }, [])

  const onHeadlineFlipEnd = (event) => {
    if (event.propertyName !== 'opacity') return
    if (!event.currentTarget.classList.contains('is-leaving')) return
    setLeaving(-1)
  }

  // Play once (no loop, no reverse). Reduced motion skips playback and holds
  // a still frame. After `ended`, stay on the last frame — never restart.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.loop = false

    const holdLastFrame = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return
      video.pause()
      video.currentTime = Math.max(0, video.duration - 0.05)
    }

    if (window.matchMedia(REDUCED_MOTION).matches) {
      video.autoplay = false
      video.pause()

      if (video.readyState >= 1) {
        holdLastFrame()
        return undefined
      }

      video.addEventListener('loadedmetadata', holdLastFrame, { once: true })
      return () => video.removeEventListener('loadedmetadata', holdLastFrame)
    }

    const onEnded = () => {
      holdLastFrame()
    }

    video.addEventListener('ended', onEnded)
    return () => video.removeEventListener('ended', onEnded)
  }, [])

  return (
    <section className="hero">
      <video
        className="hero__media"
        ref={videoRef}
        poster={HERO_POSTER}
        autoPlay
        muted
        playsInline
        preload="auto"
        fetchPriority="high"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      >
        <source media="(max-width: 760px)" src={HERO_VIDEO_SMALL} type="video/mp4" />
        <source src={HERO_VIDEO} type="video/mp4" />
        <img
          className="hero__media"
          src={HERO_IMAGE}
          alt="Scientist holding a Frontier research vial"
        />
      </video>
      <div className="hero__veil" />
      <div className="hero__fade hero__fade--top" />
      <div className="hero__fade hero__fade--bottom" />

      <div className="hero__frame">
        <nav className={`hero__nav${menuOpen ? ' is-open' : ''}`} aria-label="Primary">
          <ul className="hero__links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a className="hero__brand" href="#top" aria-label="Frontier home">
            <img src={LOGO_MARK} alt="Frontier" fetchPriority="high" decoding="async" />
          </a>

          <div className="hero__nav-end">
            <a className="hero__signin" href="#signin">
              Sign in
            </a>
            <a className="hero__nav-cta" href="#products">
              View Research Products
            </a>
          </div>

          <button
            className={`hero__menu-btn${menuOpen ? ' is-open' : ''}`}
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
          </button>
        </nav>

        <div className="hero__main">
          <div className="hero__copy">
            <h1 className="hero__headline hero__reveal">
              <span className="hero__line">
                USA
                <img className="hero__flag" src={FLAG_IMAGE} alt="" />
                Manufactured
              </span>
              <span className={`hero__rotator${flipArmed ? ' is-armed' : ''}`}>
                {HEADLINES.map(([lead, tail], index) => {
                  const active = index === headline
                  const exiting = index === leaving
                  return (
                    <span
                      className={`hero__variant${active ? ' is-active' : ''}${exiting ? ' is-leaving' : ''}`}
                      key={lead + tail}
                      aria-hidden={active ? undefined : 'true'}
                      onTransitionEnd={onHeadlineFlipEnd}
                    >
                      <span className="hero__line">{lead}</span>
                      <span className="hero__line">{tail}</span>
                    </span>
                  )
                })}
              </span>
            </h1>

            <p className="hero__lede hero__reveal hero__reveal--late">
              Peptides backed by rigorous testing and 99.6% Purity. We create our
              products in the USA to ensure quality and reliable results you can
              trust.
            </p>

            <div className="hero__actions hero__reveal hero__reveal--later">
              <a className="hero__btn hero__btn--solid" href="#products">
                View Research Products
                <ArrowIcon />
              </a>
              <a className="hero__btn hero__btn--ghost" href="#analysis">
                Request An Analysis
              </a>
            </div>
          </div>

          <ul className="hero__trust hero__reveal hero__reveal--later">
            {TRUST.map((item) => (
              <li className="hero__trust-item" key={item}>
                <span className="hero__check" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 8.2 6.6 11.2 12.5 4.8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
