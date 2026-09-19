import './Footer.css'

const BANNER = encodeURI('/footer/Banner Image.png')
const CREST = encodeURI('/footer/Frontier-Biomend-1-Crest 1.png')
const LOGO = encodeURI('/logos/Frontier logotype white.svg')

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
  return (
    <footer className="footer">
      <img className="footer__banner" src={BANNER} alt="" aria-hidden="true" />

      <div className="footer__brand">
        <img className="footer__logo" src={LOGO} alt="Frontier Biomed" />

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

      <img className="footer__crest" src={CREST} alt="" aria-hidden="true" />
    </footer>
  )
}
