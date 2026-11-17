import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Outcomes data — brokerage benefits ─────────────────────────────────── */
const outcomes = [
  {
    id: '01',
    title: 'TIGHT SPREADS FROM 0.0 PIPS',
    description:
      'Trade 60+ forex pairs, metals, indices, and crypto with raw spreads from 0.0 pips on ECN, and 1.2 pips on Standard. Deep tier-1 liquidity, no markups, no requotes.',
    bg: 'linear-gradient(135deg, rgba(1,88,198,0.92) 0%, rgba(1,153,198,0.92) 100%)',
    accent: '#ffffff',
    href: '/accounts',
  },
  {
    id: '02',
    title: 'ULTRA-FAST EXECUTION UNDER 30MS',
    description:
      'STP/ECN routing through institutional liquidity providers. Average execution speed under 30 milliseconds, 99.9% fill rate, and no dealer intervention — fast, fair, and transparent.',
    bg: 'linear-gradient(135deg, rgba(1,153,198,0.85) 0%, rgba(77,190,81,0.85) 100%)',
    accent: '#ffffff',
    href: '/pricing',
  },
  {
    id: '03',
    title: 'REGULATED & PROTECTED FUNDS',
    description:
      'Regulated by FCA and CySEC. Client funds held in segregated tier-1 bank accounts, with negative balance protection and investor compensation cover — your capital is safeguarded.',
    bg: 'linear-gradient(135deg, rgba(77,190,81,0.88) 0%, rgba(129,206,101,0.88) 100%)',
    accent: '#ffffff',
    href: '/challenges',
  },
  {
    id: '04',
    title: 'INSTANT DEPOSITS & WITHDRAWALS',
    description:
      'Fund and withdraw in USD, EUR, GBP, or USDT via Visa, Mastercard, bank wire, Skrill, Neteller, and crypto. Same-day processing on most withdrawals, no hidden fees.',
    bg: 'linear-gradient(135deg, rgba(129,206,101,0.85) 0%, rgba(77,190,81,0.6) 100%)',
    accent: '#ffffff',
    href: '/pricing',
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function TangibleOutcomes() {
  const [activeId, setActiveId] = useState('01');

  return (
    <section className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Heading row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <h2
            className="text-[#0D0F1A] font-manrope"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            See tangible
            <br />
            <span
              style={{
                background:
                  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              outcomes
            </span>
          </h2>
          <p className="text-xs font-semibold text-[#6B7080] uppercase tracking-widest">
            — What you get
          </p>
        </div>

        {/* Stacked colored bars */}
        <div className="space-y-3">
          {outcomes.map((o) => {
            const isActive = activeId === o.id;
            return (
              <div
                key={o.id}
                onClick={() => setActiveId(o.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveId(o.id);
                  }
                }}
                role="button"
                tabIndex={0}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer ${
                  isActive ? 'shadow-[0_12px_40px_rgba(1,88,198,0.18)]' : 'hover:translate-x-1'
                }`}
                style={{ background: o.bg }}
              >
                {/* Collapsed row */}
                {!isActive && (
                  <div className="flex items-center justify-between px-6 sm:px-8 py-4">
                    <div className="flex items-center gap-4">
                      <span
                        className="text-xs sm:text-sm font-bold tabular-nums tracking-widest opacity-90"
                        style={{ color: o.accent }}
                      >
                        {o.id}
                      </span>
                      <span
                        className="text-sm sm:text-base font-extrabold tracking-wide"
                        style={{ color: o.accent }}
                      >
                        {o.title}
                      </span>
                    </div>
                    <ChevronRight
                      size={20}
                      style={{ color: o.accent }}
                      className="opacity-70 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                )}

                {/* Expanded row */}
                {isActive && (
                  <div className="px-6 sm:px-10 py-7 sm:py-9">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="text-xs sm:text-sm font-bold tabular-nums tracking-widest"
                        style={{ color: o.accent }}
                      >
                        {o.id}
                      </span>
                      <ArrowRight size={16} style={{ color: o.accent }} />
                      <h3
                        className="text-base sm:text-xl font-extrabold tracking-wide"
                        style={{ color: o.accent }}
                      >
                        {o.title}
                      </h3>
                    </div>
                    <p
                      className="text-sm sm:text-base max-w-2xl leading-relaxed mb-5"
                      style={{ color: o.accent, opacity: 0.95 }}
                    >
                      {o.description}
                    </p>
                    <Link
                      to={o.href}
                      className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                      style={{ color: o.accent }}
                    >
                      Learn more
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}

                {/* Subtle decorative shape — bottom right corner */}
                <div
                  aria-hidden="true"
                  className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.3)', filter: 'blur(20px)' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
