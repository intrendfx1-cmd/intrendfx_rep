import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import '../landing.css';

const steps = [
  {
    number: '01',
    title: 'Open Your Account',
    desc: 'Pick an account type that matches your trading style — Standard, Pro, ECN, or VIP. Sign-up takes under 60 seconds and the dashboard activates instantly.',
  },
  {
    number: '02',
    title: 'Verify & Fund',
    desc: 'Complete KYC with a government ID and proof of address. Fund your account from $100 via Visa, Mastercard, bank wire, Skrill, Neteller, or crypto in USD, EUR, GBP, or USDT.',
  },
  {
    number: '03',
    title: 'Trade Global Markets',
    desc: 'Trade 60+ forex pairs, metals, indices, commodities, and crypto CFDs on MT4, MT5, or the inTrendFX Web Platform. Spreads from 0.0 pips, leverage up to 1:500, no requotes.',
  },
  {
    number: '04',
    title: 'Withdraw Anytime',
    desc: 'Request a withdrawal from your client area and receive funds in USD, EUR, GBP, or USDT. Most withdrawals are processed the same business day.',
  },
];

const rules = [
  { label: 'Min Deposit', value: '$100', desc: 'Open a Standard account from just $100. Pro, ECN, and VIP tiers have higher minimums.' },
  { label: 'Spreads From', value: '0.0 pips', desc: 'Raw interbank spreads on ECN. 0.6 pips on Pro, 1.2 pips on Standard — all transparent.' },
  { label: 'Max Leverage', value: 'Up to 1:500', desc: 'Flexible leverage by instrument: 1:500 majors, 1:200 metals, 1:100 indices, 1:20 crypto.' },
  { label: 'Execution Speed', value: '<30ms avg', desc: 'STP/ECN routing with no dealer intervention. 99.9% fill rate, no requotes on liquid pairs.' },
  { label: 'Negative Balance Protection', value: 'Always on', desc: 'Your account balance can never go below zero — even during extreme market gaps.' },
  { label: 'Strategy Restrictions', value: 'None', desc: 'Manual, EAs, copy trading, scalping, hedging, and news trading are all permitted.' },
];

export default function HowItWorksPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">How It Works</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            From sign-up to <span className="text-[#0158c6]">live trading</span> in four simple steps
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Our onboarding is designed to be straightforward. No paperwork, no branch visits,
            no hidden requirements. Just open, fund, and trade global markets in minutes.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.number} className={`flex flex-col md:flex-row gap-6 md:gap-12 py-12 ${i < steps.length - 1 ? 'border-b border-[#E8EAF0]' : ''}`}>
              <div className="shrink-0">
                <span className="text-sm font-bold text-[#0158c6]">{step.number}</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0D0F1A] mb-3">{step.title}</h3>
                <p className="text-base text-[#6B7080] leading-relaxed max-w-xl">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section className="py-14 md:py-24 px-6 bg-[#0C0C1D]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-4">
              Trading <span className="text-[#0158c6]">Conditions</span>
            </h2>
            <p className="text-base sm:text-lg text-[#9AA0B4]">Clear, documented, no surprises. Know exactly what you're getting before you fund.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((r) => (
              <div key={r.label} className="bg-[#141428] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 sm:p-8">
                <p className="text-sm text-[#9AA0B4] mb-2">{r.label}</p>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ letterSpacing: '-0.03em' }}>{r.value}</div>
                <p className="text-sm text-[#9AA0B4] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
            Ready to trade? <span className="text-[#0158c6]">Let's begin.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] mb-8">Open a live account or try a free demo today.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/pricing" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all">
              View Accounts <ArrowRight size={16} />
            </Link>
            <Link to="/faqs" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#E8EAF0] text-[#0D0F1A] font-semibold text-sm hover:border-[#0158c6] hover:text-[#0158c6] transition-all">
              Read FAQs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
