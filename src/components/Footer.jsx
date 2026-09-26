import { useCallback, useRef } from 'react'
import './Footer.css'

const BANNER = encodeURI('/footer/Banner Image.png')
const CREST = encodeURI('/footer/Frontier-Biomend-1-Crest 1.png')
const LOGO = encodeURI('/logos/Frontier logotype white.svg')

/* Same caps as the COA certificate: pointer offset is ±0.5, then ×2. */
const MAX_TILT_Y = 6
const MAX_TILT_X = 4.5

const COLUMNS = [
  {
    heading: 'Safety',
    links: ['Batch verification', 'COA standards', 'Multi-panel testing'],
  },
  {
    heading: 'Compliance',
    links: ['FAQs', 'RUO vs. pharmacy'],
  },
  {
    heading: 'Company',
    links: ['Contact'],
  },
  {
    heading: 'Portals',
    links: ['Admin sign in', 'Affiliate sign in', 'Support sign in', 'WMS sign in', 'Accountant sign in'],
  },
]

export default function Footer() {
  const crestRef = useRef(null)

  const track = useCallback((event) => {
    const crest = crestRef.current
    if (!crest || event.pointerType === 'touch') return
    const box = crest.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    crest.style.setProperty('--crest-ry', `${x * MAX_TILT_Y * 2}deg`)
    crest.style.setProperty('--crest-rx', `${-y * MAX_TILT_X * 2}deg`)
  }, [])

  const reset = useCallback(() => {
    const crest = crestRef.current
    if (!crest) return
    crest.style.removeProperty('--crest-ry')
    crest.style.removeProperty('--crest-rx')
  }, [])

  return (
    <footer className="footer">
      <img
        className="footer__banner"
        src={BANNER}
        alt=""
        aria-hidden="true"
        width={1921}
        height={1004}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />

      <div className="footer__brand">
        <img
          className="footer__logo"
          src={LOGO}
          alt="Frontier Biomed"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />

        <p className="footer__tagline">
          One researcher and doctor platform for sourcing, telemedicine, and support.
        </p>

        <address className="footer__contact">
          <a href="mailto:info@frontierbiomed.com">Info@frontierbiomed.com</a>
          <span>Frontier Biomed LLC</span>
          <span>429 S Main Street, Rochester Hills, MI 48307</span>
        </address>
      </div>

      <nav className="footer__nav" aria-label="Footer">
        {COLUMNS.map((column) => (
          <div className="footer__col" key={column.heading}>
            <h2 className="footer__col-title">{column.heading}</h2>
            <ul className="footer__links">
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div
        className="footer__crest"
        ref={crestRef}
        onPointerMove={track}
        onPointerLeave={reset}
      >
        <img
          className="footer__crest-img"
          src={CREST}
          alt=""
          aria-hidden="true"
          width={599}
          height={599}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      </div>
    </footer>
  )
}
