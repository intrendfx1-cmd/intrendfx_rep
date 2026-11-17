import {
  Globe, BarChart2, Zap, Layers, ShieldCheck,
  HeadphonesIcon, LayoutDashboard, BookOpen, Wallet
} from 'lucide-react';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

const features = [
  { icon: BarChart2,       title: 'Tier-1 Liquidity',             desc: 'Aggregated institutional liquidity feeds with sub-30ms execution across all 60+ instruments.' },
  { icon: ShieldCheck,     title: 'Regulated & Protected',        desc: 'FCA and CySEC oversight, segregated client funds, negative balance protection, and investor compensation cover.' },
  { icon: Zap,             title: 'Instant Order Execution',      desc: 'STP/ECN routing with no dealer intervention, no requotes, and full real-time position monitoring.' },
  { icon: Globe,           title: 'Global 24/5 Access',           desc: 'Trade Sydney, Tokyo, London, and New York sessions from a single unified dashboard.' },
  { icon: LayoutDashboard, title: 'Pro Trading Platforms',        desc: 'MT4, MT5, the inTrendFX Web Platform, and iOS/Android mobile apps — fully synced across devices.' },
  { icon: Wallet,          title: 'Fast Deposits & Withdrawals',  desc: 'Cards, bank wire, Skrill, Neteller, and crypto in USD, EUR, GBP, and USDT — most withdrawals processed the same day.' },
  { icon: Layers,          title: 'Flexible Account Types',       desc: 'Standard, Pro, ECN, VIP, and swap-free Islamic accounts to match every trading style.' },
  { icon: HeadphonesIcon,  title: '24/5 Multilingual Support',    desc: 'Live chat, email, and phone support in English, Spanish, Portuguese, Arabic, and more.' },
  { icon: BookOpen,        title: 'Education & Market Research',  desc: 'Daily morning briefings, webinars, video tutorials, market analysis, and an economic calendar.' },
];

export default function WhyChooseUs() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.08, 70);

  return (
    <section id="tools" className="bg-[#0C0C1D] py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal mb-10 md:mb-16 max-w-2xl">
          <h2
            className="text-white font-manrope mb-5"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Why Traders Choose{' '}
            <span className="text-[#0158c6]">inTrendFX</span>
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4]" style={{ lineHeight: 1.7 }}>
            Everything you need to trade global markets — built into one regulated forex brokerage.
          </p>
        </div>

        {/* Feature rows */}
        <div ref={cardsRef}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="stagger-child border-t border-[rgba(255,255,255,0.08)] py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-[rgba(1,88,198,0.1)] flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#0158c6]" />
                </div>

                {/* Title */}
                <h3 className="text-white text-lg sm:text-xl font-bold font-manrope sm:w-64 shrink-0">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#9AA0B4] text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
          {/* Bottom border for last row */}
          <div className="border-t border-[rgba(255,255,255,0.08)]" />
        </div>

      </div>
    </section>
  );
}
