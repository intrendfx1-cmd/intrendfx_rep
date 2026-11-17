import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// §C — Cashback / Loyalty Tiers
// Insertion: after HomePricing (§13).
// Wrapper pattern cloned from TradingPlatform.jsx two-column layout
// (left text + right card) to match existing visual rhythm.

const tiers = [
  { milestone: 'Silver — entry tier',            split: '$1 / lot' },
  { milestone: 'Gold — 10+ lots/month',          split: '$2 / lot' },
  { milestone: 'Platinum — 50+ lots/month',      split: '$3 / lot' },
  { milestone: 'Diamond — 200+ lots/month',      split: '$5 / lot' },
];

export default function ProfitSplit() {
  const { ref: leftRef }  = useScrollAnimation(0.1);
  const { ref: rightRef } = useScrollAnimation(0.1);

  return (
    <section className="bg-[#FAFBFD] py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left: Heading + Body */}
          <div ref={leftRef} className="scroll-reveal-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.08)] border border-[rgba(1,88,198,0.15)] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
              <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">Loyalty Rewards</span>
            </div>
            <h2
              className="font-manrope text-[#0D0F1A] mb-6"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Earn up to <span className="text-[#0158c6]">$5 cashback per lot</span>
            </h2>
            <p className="text-base sm:text-lg text-[#6B7080] leading-relaxed mb-8">
              At inTrendFX, every client starts on the Silver loyalty tier with $1
              cashback on every standard lot. Trade more, climb the tiers automatically,
              and earn up to $5 per lot at Diamond — credited daily, no minimums.
            </p>
            <Link
              to="/trading"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#4dbe51] hover:gap-3 transition-all"
            >
              View Full Loyalty Program <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right: Scaling tier card */}
          <div ref={rightRef} className="scroll-reveal-right bg-white border border-[#E8EAF0] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E8EAF0] bg-[#0C0C1D]">
              <p className="text-xs font-bold text-[#0158c6] uppercase tracking-widest mb-1">Cashback Tiers</p>
              <p className="text-base font-bold text-white">Your rebate grows with your volume</p>
            </div>
            <div>
              {tiers.map((t, i) => (
                <div
                  key={t.milestone}
                  className={`flex items-center justify-between px-6 py-5 ${i < tiers.length - 1 ? 'border-b border-[#E8EAF0]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#0158c6] w-6 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm sm:text-base text-[#0D0F1A] font-semibold">{t.milestone}</p>
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-[#0158c6] tabular-nums">{t.split}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
