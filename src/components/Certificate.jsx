import { useCallback, useRef } from 'react'
import './Certificate.css'

/* Full lockup: logomark + "Frontier" + the BIOMED sub-label, all in one asset. */
const LOGO = encodeURI('/logos/Frontier logotype primary.svg')

const ADDRESS = ['Frontier Biomed LLC', '429 S. Main Street', 'Rochester, MI 48307']
const CONTACT = ['Info@frontierbiomed.com', 'LinkedIn']

/* Labels are cased for screen readers; the caps are a text-transform. */
const FIELDS = [
  ['Compound', 'CJC-1295 No DAC / Ipamorelin'],
  ['Lot number', 'LOT-200501-A'],
  ['Manufacture date', '01 May 2025'],
  ['Expiration', '01 May 2027'],
  ['Third-party lab', '[Lab Name]'],
  ['Chain of custody ref', 'CCR-200501'],
]

/* Angle brackets and the >= glyph live in JS strings so they survive as literal
   characters rather than being read as markup. */
const ROWS = [
  { attribute: 'PURITY (HPLC)', method: 'HPLC-UV', spec: '>99.0%', result: '\u226599.5%' },
  { attribute: 'PURITY (MS)', method: 'LC-MS', spec: 'CONFIRMED', result: 'CONFIRMED' },
  { attribute: 'ENDOTOXIN', method: 'USP <85>', spec: '<0.1 EU/mg', result: '<0.1 EU/mg' },
  { attribute: 'STERILITY', method: 'USP <71>', spec: 'PASS', result: 'PASS' },
]

/* Small enough that the type stays legible through the tilt. */
const MAX_TILT_Y = 6
const MAX_TILT_X = 4.5

export default function Certificate() {
  const cardRef = useRef(null)

  const track = useCallback((event) => {
    const card = cardRef.current
    if (!card || event.pointerType === 'touch') return
    const box = card.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    card.style.setProperty('--cert-ry', `${x * MAX_TILT_Y * 2}deg`)
    card.style.setProperty('--cert-rx', `${-y * MAX_TILT_X * 2}deg`)
  }, [])

  const reset = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.removeProperty('--cert-ry')
    card.style.removeProperty('--cert-rx')
  }, [])

  return (
    <div className="certificate" ref={cardRef} onPointerMove={track} onPointerLeave={reset}>
      <header className="cert__header">
        <div className="cert__brand">
          <img className="cert__logo" src={LOGO} alt="Frontier Biomed" loading="lazy" decoding="async" />
          <p className="cert__tagline">Analytical data for this shipment</p>
        </div>

        <div className="cert__contact">
          <p className="cert__address">
            {ADDRESS.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <p className="cert__address">
            {CONTACT.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </div>
      </header>

      <div className="cert__body">
        <h3 className="cert__title">Certificate of Analysis</h3>

        <dl className="cert__fields">
          {FIELDS.map(([label, value]) => (
            <div className="cert__field" key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <table className="cert__table">
          <thead>
            <tr>
              <th scope="col">Attribute</th>
              <th scope="col">Method</th>
              <th scope="col">Spec</th>
              <th scope="col">Result</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.attribute}>
                <th scope="row">{row.attribute}</th>
                <td>{row.method}</td>
                <td>{row.spec}</td>
                <td className="cert__result">{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="cert__fine">
          This item is regularly tested by the manufacturer and meets all requirements
          defined by the appropriate current ingredient specification. This item is
          manufactured, packaged, stored, and shipped in accordance with good
          Manufacturing Practices and under modern sanitary conditions.
        </p>

        <div className="cert__sign">
          <div>
            <p className="cert__signature">Benzy Ross</p>
            <p className="cert__role">Quality Control Manager</p>
            <p className="cert__date">01 May 2024</p>
          </div>
          <p className="cert__stamp">Verified</p>
        </div>
      </div>

      <footer className="cert__footer">
        Frontier Biomed LLC | ISO 13485:2016 Certified | www.frontierbiomed.com
      </footer>
    </div>
  )
}
