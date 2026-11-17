import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import '../landing.css';

const faqCategories = {
  'General': [
    { q: 'What is inTrendFX?', a: 'inTrendFX is a global online forex and CFD brokerage. We give retail and professional clients access to 60+ markets — forex, metals, indices, commodities, and crypto CFDs — with tight spreads, fast execution, and tier-1 liquidity.' },
    { q: 'How does inTrendFX work?', a: 'You open a live account, complete KYC, deposit funds, and start trading on MT4, MT5, or the inTrendFX Web Platform. We route your orders STP/ECN through tier-1 liquidity providers with no dealer intervention.' },
    { q: 'Is inTrendFX a real trading platform?', a: 'Yes. inTrendFX is a regulated brokerage. All trades are executed live on the interbank market with real prices, real liquidity, and real-time fills under 30ms on average.' },
    { q: 'Is inTrendFX regulated?', a: 'Yes. We operate under FCA and CySEC oversight. Client funds are held in segregated tier-1 bank accounts, and we provide negative balance protection and investor compensation cover where applicable.' },
    { q: 'Who is this brokerage for?', a: 'Retail and professional forex traders worldwide. Whether you trade manually, run EAs, scalp, swing, or copy-trade, our platform supports every style with no strategy restrictions.' },
    { q: 'Is this suitable for beginners?', a: 'Yes. inTrendFX is designed for both beginners and experienced traders. Beginners can open a Standard account from just $100 and access our full education library, demo accounts, and 24/5 support.' },
    { q: 'Why choose inTrendFX over other brokers?', a: 'Tier-1 liquidity, sub-30ms execution, transparent spreads from 0.0 pips, multi-currency wallets (USD, EUR, GBP, USDT), same-day withdrawals, and zero strategy restrictions — EAs, copy trading, and news trading are all allowed.' },
    { q: 'Is inTrendFX safe and trustworthy?', a: 'We focus on transparency, regulatory compliance, and strong client-fund protection. Every spread, swap, and fee is published up-front. We prioritise long-term trust over short-term marketing tactics.' },
  ],
  'Trading': [
    { q: 'Which instruments can I trade?', a: '60+ instruments across forex (majors, minors, exotics), metals (XAU/USD, XAG/USD), global indices (US30, NAS100, GER40, UK100, JP225), commodities (WTI, brent, natural gas), and crypto CFDs (BTC, ETH, SOL, XRP).' },
    { q: 'What is the maximum leverage?', a: 'Up to 1:500 on major forex pairs, 1:200 on metals, 1:100 on indices and commodities, and 1:20 on crypto CFDs. Leverage is shown per instrument inside the platform.' },
    { q: 'What are the spreads and commissions?', a: 'Spreads start from 1.2 pips on Standard accounts with zero commission, 0.6 pips on Pro, and 0.0 pips raw on ECN with a flat $3.5 per lot per side. All pricing is fully transparent and shown live.' },
    { q: 'What happens during a margin call?', a: 'If your equity drops below the margin requirement, you receive a margin call notification. If equity falls further, positions are auto-closed starting from the largest loss. Negative balance protection ensures you never owe more than your deposit.' },
    { q: 'Can I trade anytime?', a: 'Yes. Forex trades 24/5 across the Sydney, Tokyo, London, and New York sessions. Crypto CFDs trade 24/7. Indices and commodities follow their underlying exchange hours.' },
    { q: 'Can I use my own trading strategy?', a: 'Yes. Manual trading, EAs, copy trading, high-frequency setups, scalping, hedging, and news trading are all permitted on every account type. Zero strategy restrictions.' },
    { q: 'Do you offer a demo account?', a: 'Yes. Open a free demo account in under 60 seconds and practise with virtual funds on the exact same pricing and execution as our live environment.' },
  ],
  'Withdrawals': [
    { q: 'How do I withdraw funds?', a: 'Request a withdrawal from your client area. Withdrawals are processed by our operations team, typically the same business day, in USD, EUR, GBP, or USDT.' },
    { q: 'What withdrawal methods are available?', a: 'Visa, Mastercard, bank wire, SEPA, Skrill, Neteller, and USDT (TRC20/ERC20). Withdrawals are sent back to your original funding source first, with any surplus going to a bank or e-wallet in your name.' },
    { q: 'How long do withdrawals take?', a: 'Card and e-wallet withdrawals typically clear within a few hours. Bank wires settle in 1-3 business days. Crypto withdrawals usually arrive within minutes once approved by compliance.' },
    { q: 'Are there any hidden fees?', a: 'No. inTrendFX follows a transparent pricing model. No deposit fees. No withdrawal fees on most methods. No surprise FX conversion charges — your wallet currency is your wallet currency.' },
    { q: 'Is there a minimum withdrawal?', a: 'The minimum withdrawal amount is $20 equivalent. There is no maximum; large withdrawals may require additional KYC verification under standard compliance procedures.' },
    { q: 'Which currencies can I receive withdrawals in?', a: 'USD, EUR, GBP, or USDT (TRC20/ERC20). You pick at the time of withdrawal — card, bank wire, SEPA, e-wallet, or stablecoin.' },
  ],
  'Account': [
    { q: 'How do I create an account?', a: 'Click "Open Account" on any page, fill in your basic details (name, email, country), verify your email, and you are ready to fund your account. The entire sign-up process takes under 60 seconds.' },
    { q: 'How long does account activation take?', a: 'Account creation is instant. Full KYC verification typically completes within 24 hours of submitting your documents. You can deposit and trade as soon as KYC is approved.' },
    { q: 'What is the minimum deposit?', a: 'Standard accounts start from $100, Pro from $1,000, ECN from $2,500, and VIP from $25,000. You can deposit more than the minimum at any time.' },
    { q: 'Do I need prior trading experience?', a: 'No, but basic knowledge of forex trading helps. Beginners can open a Standard account and start with a free demo, then move to live trading once they are comfortable with the platform.' },
    { q: 'How do I track my performance?', a: 'Your client area dashboard tracks profit and loss, equity, free margin, full trade history, and detailed analytics — all updated in real time across MT4, MT5, and our web platform.' },
    { q: 'What documents do I need for KYC?', a: 'A valid government-issued photo ID (passport or national ID) and proof of address (utility bill or bank statement, dated within the last three months). We verify everything digitally.' },
    { q: 'Can I have multiple accounts?', a: 'Yes. You can open multiple live accounts under one client profile — for example a Standard for manual trading and an ECN for algos. Each account operates independently with its own balance and history.' },
  ],
};

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all mb-3 ${isOpen ? 'border-[#0158c6] bg-[rgba(1,88,198,0.03)]' : 'border-[#E8EAF0] bg-white hover:border-[rgba(1,88,198,0.3)]'}`}>
      <button className="w-full flex items-center justify-between px-6 py-5 text-left gap-4" onClick={onToggle}>
        <span className={`text-sm sm:text-base font-semibold transition-colors ${isOpen ? 'text-[#0158c6]' : 'text-[#0D0F1A]'}`}>{faq.q}</span>
        <ChevronDown size={18} className={`shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-[#0158c6]' : 'text-[#6B7080]'}`} />
      </button>
      <div className="overflow-hidden" style={{ maxHeight: isOpen ? '1500px' : '0', opacity: isOpen ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease' }}>
        <div className="px-6 pb-5">
          <div className="h-px bg-[rgba(1,88,198,0.1)] mb-4" />
          <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState('General-0');
  const [activeCategory, setActiveCategory] = useState('General');

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">FAQs</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Frequently asked <span className="text-[#0158c6]">questions</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about inTrendFX. Can't find what you're looking for?{' '}
            <Link to="/contact-us" className="text-[#0158c6] hover:underline">Contact our team</Link>.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8 md:mb-10 justify-center">
            {Object.keys(faqCategories).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0158c6] text-white'
                    : 'bg-[#F0F2F8] text-[#6B7080] hover:text-[#0D0F1A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div>
            {faqCategories[activeCategory].map((faq, i) => {
              const key = `${activeCategory}-${i}`;
              return (
                <FAQItem
                  key={key}
                  faq={faq}
                  isOpen={openIndex === key}
                  onToggle={() => setOpenIndex(openIndex === key ? null : key)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-6 bg-[#0C0C1D]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-base text-[#9AA0B4] mb-8">Our support team is available to help you with any queries.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact-us" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all">
              Contact Support
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[rgba(255,255,255,0.15)] text-white font-semibold text-sm hover:border-[#0158c6] hover:text-[#0158c6] transition-all">
              View Accounts
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
