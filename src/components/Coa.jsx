import './Coa.css'

const COA_DOC = encodeURI('/COA/Screenshot 2026-09-16 at 10.09.37\u202fPM 1.png')
const DOCTOR = encodeURI('/COA/Female doctor.png')
const ICON_PETRI = encodeURI('/COA/magnific_create-a-minimal-ultrarea_w4zVBdw7EI 1.png')
const ICON_DISH = encodeURI('/COA/magnific_create-a-minimal-premium-_w4zMMzs7EI 1.png')
const ICON_MOLECULE = encodeURI('/COA/magnific_create-a-minimal-premium-_ov5sj7F829 1.png')

const TESTS = [
  {
    title: 'Peptide content',
    copy: 'Confirms the stated peptide mass per vial.',
    icon: ICON_MOLECULE,
  },
  {
    title: 'Residual solvents',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_PETRI,
  },
  {
    title: 'Heavy metals',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_DISH,
  },
  {
    title: 'Endotoxin',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_DISH,
  },
  {
    title: 'Mass Spectrometry',
    copy: 'Verifies manufacturing solvents fall within specified limits.',
    icon: ICON_MOLECULE,
  },
]

export default function Coa() {
  return (
    <section className="coa" id="testing">
      <div className="coa__intro">
        <h2 className="coa__headline">
          Built for Scrutiny. A Robust
          <br />
          Certificate of Analysis.
        </h2>
        <p className="coa__lede">
          Every research product undergoes an intensive testing panel that you
          can view so you can have peace of mind.
        </p>
      </div>

      <div className="coa__stage">
        <ul className="coa__cards">
          {TESTS.map((test) => (
            <li className="coa__card" key={test.title}>
              <h3>{test.title}</h3>
              <img className="coa__card-icon" src={test.icon} alt="" />
              <p>{test.copy}</p>
            </li>
          ))}
        </ul>

        <img
          className="coa__doc"
          src={COA_DOC}
          alt="Certificate of Analysis for a Frontier research lot"
        />

        <span className="coa__rule" aria-hidden="true" />

        <img
          className="coa__doctor"
          src={DOCTOR}
          alt="Clinician reviewing research peptide quality"
        />
      </div>
    </section>
  )
}
