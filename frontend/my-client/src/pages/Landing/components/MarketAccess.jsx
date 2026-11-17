import { TrendingUp, Coins, BarChart2, Bitcoin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

const markets = [
  {
    icon: TrendingUp,
    title: 'Forex Pairs',
    desc: 'Trade 50+ major, minor, and exotic pairs with real-time institutional liquidity.',
    tag: 'EUR/USD · GBP/USD · USD/JPY',
    stats: [{ label: 'Type', value: 'Live' }, { label: 'Markets', value: '24/5' }],
  },
  {
    icon: Coins,
    title: 'Metals & Commodities',
    desc: 'Gold, silver, and oil — hedge currency exposure or take directional setups.',
    tag: 'XAU/USD · XAG/USD · WTI',
    stats: [{ label: 'Type', value: 'Live' }, { label: 'Settlement', value: 'Direct' }],
  },
  {
    icon: BarChart2,
    title: 'Global Indices',
    desc: 'Speculate on US, European, and Asian indices with competitive margins.',
    tag: 'US30 · NAS100 · GER40',
    stats: [{ label: 'Type', value: 'Live' }, { label: 'Markets', value: 'Global' }],
  },
  {
    icon: Bitcoin,
    title: 'Crypto CFDs',
    desc: 'Trade major cryptocurrencies 24/7 with full margin flexibility — no wallet required.',
    tag: 'BTC · ETH · SOL',
    stats: [{ label: 'Type', value: 'Live' }, { label: 'Markets', value: '24/7' }],
  },
];

export default function MarketAccess() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.1, 100);

  return (
    <section id="markets" className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* Left column — heading + description */}
          <div ref={headerRef} className="scroll-reveal lg:w-5/12 lg:sticky lg:top-32">
            <h2
              className="text-[#0D0F1A] font-manrope mb-5"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Trade Global Markets on{' '}
              <span className="text-[#0158c6]">One Platform</span>
            </h2>
            <p className="text-base sm:text-lg text-[#6B7080]" style={{ lineHeight: 1.7 }}>
              Forex, metals, indices, and crypto — all in one unified live trading account.
            </p>

            {/* CTA */}
            <div className="mt-10">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] hover:shadow-[0_8px_28px_rgba(1,88,198,0.4)] transition-all font-manrope"
              >
                Open Live Account
                <span className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5 2l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Right column — 2x2 cards grid */}
          <div ref={cardsRef} className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {markets.map((market) => {
              const Icon = market.icon;
              return (
                <div
                  key={market.title}
                  className="stagger-child group bg-white border border-[#E8EAF0] rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.08)] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[rgba(1,88,198,0.08)] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[#0158c6]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0D0F1A] font-manrope leading-tight">{market.title}</h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#0158c6]">{market.tag}</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#6B7080] leading-relaxed mb-3">
                    {market.desc}
                  </p>

                  <div className="flex gap-6 border-t border-[#E8EAF0] pt-3">
                    {market.stats.map((s) => (
                      <div key={s.label}>
                        <div className="text-xs font-bold text-[#0D0F1A] font-manrope">{s.value}</div>
                        <div className="text-[10px] text-[#6B7080]">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
