import './Steps.css'

// Full-resolution WhatsApp exports served as-is (no resize/re-encode).
// Spaces in filenames are encoded for the public URL.
const STEPS = [
  {
    short: 'Sourcing',
    title: 'Sourcing & Raw Material Testing',
    body: 'APIs are sourced from US FDA-certified facilities and tested in our USA facilities for toxins, heavy metals, and raw material purity.',
    media: encodeURI('/steps/WhatsApp Image 2026-09-24 at 1.06.39 AM.jpeg'),
    w: 1600,
    h: 1198,
    note: 'Every incoming lot is screened before it enters production: identity, purity, and contaminant checks so only qualified material moves forward.',
  },
  {
    short: 'Preparation',
    title: 'Preparation & Sterilization',
    body: 'Raw materials are sterilized and prepared into compounds for the lyophilization process.',
    media: encodeURI('/steps/WhatsApp Image 2026-09-24 at 1.06.40 AM.jpeg'),
    w: 1600,
    h: 1194,
    note: 'Controlled prep and sterilization get each compound ready for freeze-drying, with clean handling from weigh-out through transfer into the lyo cycle.',
  },
  {
    short: 'Manufacturing',
    title: 'Manufacturing & Freeze-Drying',
    body: 'Finished compounds are manufactured in our South Carolina, USA facility, freeze-dried, and sent to our seal crimp division.',
    media: encodeURI('/steps/WhatsApp Image 2026-09-24 at 1.06.40 AM (1).jpeg'),
    w: 1600,
    h: 1194,
    note: 'Lyophilized in South Carolina, then moved to seal and crimp so each vial is closed under the same domestic process chain. No offshore handoff mid-batch.',
  },
  {
    short: 'Quality',
    title: 'Quality & Safety Testing',
    body: 'Each batch undergoes a 14-day testing process for endotoxins, mold, bacteria, and metals.',
    media: encodeURI('/steps/WhatsApp Image 2026-09-24 at 1.06.40 AM (2).jpeg'),
    w: 1600,
    h: 1198,
    note: 'Batches are held through a full 14-day safety panel. Nothing releases until endotoxin, mold, bacteria, and metals results clear the bar.',
  },
  {
    short: 'Shipping',
    title: 'Secure Shipping',
    body: 'Once testing is complete, products are securely packaged and shipped to you via standard or overnight delivery.',
    media: encodeURI('/steps/WhatsApp Image 2026-09-24 at 1.06.40 AM (3).jpeg'),
    w: 1600,
    h: 1194,
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
                width={step.w}
                height={step.h}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
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
