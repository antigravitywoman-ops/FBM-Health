import './Steps.css'

const STEPS = [
  {
    label: 'Step 5',
    title: 'Secure Shipping',
    body: 'Once testing is complete, products are securely packaged and shipped to you via standard or overnight delivery.',
    media: '/steps/step-5.jpg',
    note: 'After release, orders are packed for transit and shipped standard or overnight: sealed, labeled, and tracked from our facility to your door.',
  },
]

function BoxIcon() {
  return (
    <svg className="step__icon" viewBox="0 0 24 26" fill="none" aria-hidden="true">
      <path
        d="M12 1.2 22.3 6.9v12.2L12 24.8 1.7 19.1V6.9L12 1.2Z"
        fill="currentColor"
        fillOpacity=".24"
      />
      <path
        d="M12 1.2 22.3 6.9v12.2L12 24.8 1.7 19.1V6.9L12 1.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M1.9 7 12 12.7 22.1 7M12 12.7V24.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.4 3.1 19.6 8.8v4.1L9.4 7.2V3.1Z" fill="currentColor" />
    </svg>
  )
}

export default function Steps() {
  return (
    <section className="steps" id="process">
      {STEPS.map((step) => (
        <article className="step" key={step.label}>
          <img className="step__media" src={step.media} alt="" />
          <div className="step__scrim" />

          <div className="step__content">
            <p className="step__label">{step.label}</p>
            <h2 className="step__title">{step.title}</h2>
            <p className="step__body">{step.body}</p>
            <span className="step__divider" />
          </div>

          <aside className="step__note">
            <BoxIcon />
            <p>{step.note}</p>
          </aside>
        </article>
      ))}
    </section>
  )
}
