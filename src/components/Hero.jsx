import { useEffect, useRef, useState } from 'react'
import './Hero.css'

const HERO_IMAGE = encodeURI(
  '/hero/magnific_reate-a-premium-elegant-p_4RcHwtz9Aa 1.png',
)
const HERO_POSTER = '/hero/hero-poster.jpg'
const HERO_VIDEO = '/hero/hero-loop.mp4'
const HERO_VIDEO_SMALL = '/hero/hero-loop-mobile.mp4'
const FLAG_IMAGE = encodeURI('/hero/USA_Flag 1.png')
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
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia(REDUCED_MOTION).matches) return undefined

    const timer = setInterval(() => {
      setHeadline((index) => (index + 1) % HEADLINES.length)
    }, HEADLINE_INTERVAL)

    return () => clearInterval(timer)
  }, [])

  // With reduced motion the clip holds on its last frame instead of playing.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !window.matchMedia(REDUCED_MOTION).matches) return undefined

    video.autoplay = false
    video.pause()

    const holdLastFrame = () => {
      video.currentTime = Math.max(0, video.duration - 0.05)
    }

    if (video.readyState >= 1) {
      holdLastFrame()
      return undefined
    }

    video.addEventListener('loadedmetadata', holdLastFrame, { once: true })
    return () => video.removeEventListener('loadedmetadata', holdLastFrame)
  }, [])

  // Native loop cuts to frame 0. HTML video also cannot play in reverse, and
  // this clip has a single keyframe at t=0 — so scrubbing currentTime backward
  // stalls at the end (the decoder must rebuild the whole GOP). Capture each
  // decoded frame on the first pass, then ping-pong those bitmaps on a canvas.
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || window.matchMedia(REDUCED_MOTION).matches) {
      return undefined
    }

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return undefined

    const frames = []
    let disposed = false
    let capturing = true
    let direction = 1
    let index = 0
    let acc = 0
    let lastTs = 0
    let lastMediaTime = -1
    let rafId = 0
    let rvfcId = 0
    let fps = 24

    const setPlayhead = (seconds) => {
      const t = Math.max(0, seconds)
      canvas.dataset.heroPlayhead = t.toFixed(4)
      video.dataset.heroPlayhead = t.toFixed(4)
    }

    const paint = (source) => {
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
    }

    const snapshot = () => {
      if (typeof OffscreenCanvas === 'function') {
        const off = new OffscreenCanvas(canvas.width, canvas.height)
        const offCtx = off.getContext('2d', { alpha: false })
        if (!offCtx) return
        offCtx.drawImage(video, 0, 0, canvas.width, canvas.height)
        frames.push(off.transferToImageBitmap())
        return
      }

      const off = document.createElement('canvas')
      off.width = canvas.width
      off.height = canvas.height
      const offCtx = off.getContext('2d', { alpha: false })
      if (!offCtx) return
      offCtx.drawImage(video, 0, 0, canvas.width, canvas.height)
      frames.push(off)
    }

    const sizeCanvas = () => {
      const vw = video.videoWidth
      const vh = video.videoHeight
      if (!vw || !vh) return
      const maxLong = window.matchMedia('(max-width: 760px)').matches ? 800 : 1024
      const scale = Math.min(1, maxLong / Math.max(vw, vh))
      canvas.width = Math.max(2, Math.round(vw * scale))
      canvas.height = Math.max(2, Math.round(vh * scale))
    }

    const syncFps = () => {
      const duration = video.duration
      if (frames.length > 1 && Number.isFinite(duration) && duration > 0) {
        fps = (frames.length - 1) / duration
      }
    }

    const tick = (ts) => {
      rafId = requestAnimationFrame(tick)
      if (capturing || frames.length === 0) return

      const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0
      lastTs = ts
      acc += dt * fps

      while (acc >= 1) {
        acc -= 1
        const next = index + direction
        if (next >= frames.length) {
          direction = -1
          index = Math.max(0, frames.length - 2)
        } else if (next < 0) {
          direction = 1
          index = Math.min(1, frames.length - 1)
        } else {
          index = next
        }
      }

      paint(frames[index])
      setPlayhead(index / fps)
    }

    const beginPingPong = () => {
      if (!capturing) return
      capturing = false
      video.pause()
      syncFps()
      direction = -1
      index = Math.max(0, frames.length - 1)
      acc = 0
      lastTs = performance.now()
      if (frames[index]) paint(frames[index])
      setPlayhead(index / fps)
      if (!rafId) rafId = requestAnimationFrame(tick)
    }

    const onDecodedFrame = () => {
      if (disposed || !capturing) return

      const duration = video.duration
      const mediaTime = video.currentTime
      const frameT = 1 / Math.max(fps, 1)
      const isNewFrame = mediaTime - lastMediaTime >= frameT * 0.35

      if (isNewFrame || lastMediaTime < 0) {
        lastMediaTime = mediaTime
        if (!canvas.width) sizeCanvas()
        paint(video)
        snapshot()
        setPlayhead(mediaTime)
      }

      if (video.ended || (Number.isFinite(duration) && mediaTime >= duration - frameT)) {
        beginPingPong()
        return
      }

      if (typeof video.requestVideoFrameCallback === 'function') {
        rvfcId = video.requestVideoFrameCallback(onDecodedFrame)
      }
    }

    const captureTick = (ts) => {
      rafId = requestAnimationFrame(captureTick)
      if (!capturing) {
        cancelAnimationFrame(rafId)
        rafId = 0
        lastTs = ts
        rafId = requestAnimationFrame(tick)
        return
      }
      onDecodedFrame()
    }

    const onEnded = () => {
      beginPingPong()
    }

    const start = () => {
      sizeCanvas()
      capturing = true
      direction = 1
      lastTs = 0
      lastMediaTime = -1
      video.loop = false
      if (video.currentTime > 0.02) video.currentTime = 0
      void video.play()

      if (typeof video.requestVideoFrameCallback === 'function') {
        rvfcId = video.requestVideoFrameCallback(onDecodedFrame)
      } else if (!rafId) {
        rafId = requestAnimationFrame(captureTick)
      }
    }

    video.addEventListener('ended', onEnded)
    if (video.readyState >= 1) start()
    else video.addEventListener('loadedmetadata', start)

    return () => {
      disposed = true
      capturing = false
      cancelAnimationFrame(rafId)
      if (typeof video.cancelVideoFrameCallback === 'function' && rvfcId) {
        video.cancelVideoFrameCallback(rvfcId)
      }
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('loadedmetadata', start)
      for (const frame of frames) {
        if (typeof frame.close === 'function') frame.close()
      }
      frames.length = 0
    }
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
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        data-hero-playhead="0"
      >
        <source media="(max-width: 760px)" src={HERO_VIDEO_SMALL} type="video/mp4" />
        <source src={HERO_VIDEO} type="video/mp4" />
        <img
          className="hero__media"
          src={HERO_IMAGE}
          alt="Scientist holding a Frontier research vial"
        />
      </video>
      <canvas
        className="hero__media hero__media--loop"
        ref={canvasRef}
        aria-hidden="true"
        data-hero-playhead="0"
      />
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
            <img src={LOGO_MARK} alt="Frontier" />
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
              <span className="hero__rotator">
                {HEADLINES.map(([lead, tail], index) => (
                  <span
                    className={`hero__variant${index === headline ? ' is-active' : ''}`}
                    key={lead + tail}
                    aria-hidden={index === headline ? undefined : 'true'}
                  >
                    <span className="hero__line">{lead}</span>
                    <span className="hero__line">{tail}</span>
                  </span>
                ))}
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
