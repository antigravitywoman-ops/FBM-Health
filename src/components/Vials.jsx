import './Vials.css'

const SCENE = encodeURI('/vials/Still life of Vile and Box.png')
const CREST = encodeURI('/vials/USA Crest.png')

const CONTAMINANTS = [
  { label: 'Heavy metals', tone: 'metal' },
  { label: 'Toxins', tone: 'toxin' },
  { label: 'Impurities', tone: 'impurity' },
]

export default function Vials() {
  return (
    <section className="vials" id="packaging">
      <img
        className="vials__scene"
        src={SCENE}
        alt="Frontier presentation box beside a 10mg research vial"
      />

      <img className="vials__crest" src={CREST} alt="" aria-hidden="true" />

      <h2 className="vials__lead">
        Even The Vials Are
        <br />
        Manufactured
        <br />
        in the USA
      </h2>

      <h3 className="vials__sub">
        Ensuring No
        <br />
        Contamination
      </h3>

      <ul className="vials__list">
        {CONTAMINANTS.map((item) => (
          <li className="vials__item" key={item.label}>
            <span className={`vials__dot vials__dot--${item.tone}`} />
            <span className="vials__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
