import './Steps.css'

// Every photo is pre-cropped to the card ratio (1882 x 1110) so `object-fit`
// has nothing to trim and all five frames read identically.
const STEPS = [
  {
    short: 'Sourcing',
    title: 'Sourcing & Raw Material Testing',
    body: 'APIs are sourced from US FDA-certified facilities and tested in our USA facilities for toxins, heavy metals, and raw material purity.',
    media: '/steps/step-1.jpg',
    note: 'Every incoming lot is screened before it enters production: identity, purity, and contaminant checks so only qualified material moves forward.',
  },
  {
    short: 'Preparation',
    title: 'Preparation & Sterilization',
    body: 'Raw materials are sterilized and prepared into compounds for the lyophilization process.',
    media: '/steps/step-2.jpg',
    note: 'Controlled prep and sterilization get each compound ready for freeze-drying, with clean handling from weigh-out through transfer into the lyo cycle.',
  },
  {
    short: 'Manufacturing',
    title: 'Manufacturing & Freeze-Drying',
    body: 'Finished compounds are manufactured in our South Carolina, USA facility, freeze-dried, and sent to our seal crimp division.',
    media: '/steps/step-3.jpg',
    note: 'Lyophilized in South Carolina, then moved to seal and crimp so each vial is closed under the same domestic process chain. No offshore handoff mid-batch.',
  },
  {
    short: 'Quality',
    title: 'Quality & Safety Testing',
    body: 'Each batch undergoes a 14-day testing process for endotoxins, mold, bacteria, and metals.',
    media: '/steps/step-4.jpg',
    note: 'Batches are held through a full 14-day safety panel. Nothing releases until endotoxin, mold, bacteria, and metals results clear the bar.',
  },
  {
    short: 'Shipping',
    title: 'Secure Shipping',
    body: 'Once testing is complete, products are securely packaged and shipped to you via standard or overnight delivery.',
    media: '/steps/step-5.jpg',
    note: 'After release, orders are packed for transit and shipped standard or overnight: sealed, labeled, and tracked from our facility to your door.',
  },
]

export default function Steps() {
  return (
    <section className="steps" id="process">
      <h2 className="steps__heading">Quality Manufacturing Process</h2>

      {/* The cards are direct children of the stack on purpose: a sticky box can
          only travel inside its containing block, so they have to share one
          ancestor to stay pinned while the following cards ride up over them. */}
      <div className="steps__stack">
        {STEPS.map((step, index) => {
          const num = String(index + 1).padStart(2, '0')
          return (
            <article
              className="step"
              key={step.short}
              style={{ '--step-index': index + 1 }}
            >
              <img
                className="step__media"
                src={step.media}
                alt=""
                decoding="async"
              />
              <div className="step__scrim" />

              {/* Top-left step index on every card, including step 01. */}
              <p className="step__label">
                <span className="step__label-num">STEP {num}</span>
                <span className="step__label-sep" aria-hidden="true">
                  {' '}
                  ·{' '}
                </span>
                <span className="step__label-short">{step.short}</span>
              </p>

              <div className="step__content">
                <h3 className="step__title">{step.title}</h3>
                <p className="step__body">{step.body}</p>
                <span className="step__divider" />
              </div>

              <aside className="step__note">
                <p>{step.note}</p>
              </aside>
            </article>
          )
        })}
      </div>
    </section>
  )
}
