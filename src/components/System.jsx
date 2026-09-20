import './System.css'

const BACKGROUND = encodeURI('/system/Section background.png')

const AVATARS = [
  { src: '/system/avatar-1.png', alt: 'Frontier researcher' },
  { src: '/system/avatar-2.png', alt: 'Frontier clinician' },
  { src: '/system/avatar-3.png', alt: 'Frontier lab scientist' },
]

const CARDS = [
  { id: 'purity', label: '99.6% Purity', src: '/system/cards/purity.png', w: 414, h: 413, alt: 'Macro view of a purified peptide solution' },
  { id: 'manufactured', label: 'Manufactured in USA', src: '/system/cards/manufactured.png', w: 667, h: 418, alt: 'Vials moving through a filling line' },
  { id: 'orders', label: 'Manage all your orders', src: '/system/cards/orders.png', w: 374, h: 431, alt: 'Frontier ordering dashboard on a phone' },
  { id: 'vial-usa', label: 'Vial made in USA', src: '/system/cards/vial-usa.png', w: 421, h: 427, alt: 'Clinician in a medical facility' },
  { id: 'digital-coa', label: 'Digital COAs', src: '/system/cards/digital-coa.png', w: 647, h: 431, alt: 'Technician loading samples into an analyser' },
  { id: 'shipping', label: 'Secure Shipping', src: '/system/cards/shipping.png', w: 715, h: 433, alt: 'Sealed Frontier shipping box with tamper tape' },
  { id: 'testing', label: 'Third-party tested', src: '/system/cards/testing.png', w: 329, h: 433, alt: 'Scientist preparing a sample at a microscope' },
]

function Card({ card, duplicate }) {
  return (
    <li
      className="system__card"
      style={{ '--card-ratio': `${card.w} / ${card.h}` }}
      aria-hidden={duplicate || undefined}
    >
      <img
        className="system__card-media"
        src={card.src}
        width={card.w}
        height={card.h}
        alt={duplicate ? '' : card.alt}
      />
      <span className="system__pill">{card.label}</span>
    </li>
  )
}

export default function System() {
  return (
    <section className="system" id="system">
      <img className="system__bg" src={BACKGROUND} alt="" aria-hidden="true" />

      <div className="system__head">
        <h2 className="system__title">
          A Complete System
          <br />
          to Support <span className="system__em">Researchers</span> and{' '}
          <span className="system__em">Doctors</span>
        </h2>

        <p className="system__trust">
          <span className="system__avatars">
            {AVATARS.map((avatar) => (
              <img className="system__avatar" key={avatar.src} src={avatar.src} alt={avatar.alt} />
            ))}
          </span>
          <span className="system__trust-text">
            Trusted in the field since <span className="system__em">2016</span>
          </span>
        </p>
      </div>

      <div className="system__carousel">
        <ul className="system__track">
          {CARDS.map((card) => (
            <Card card={card} key={card.id} />
          ))}
          {CARDS.map((card) => (
            <Card card={card} key={`${card.id}-dup`} duplicate />
          ))}
        </ul>
      </div>
    </section>
  )
}
