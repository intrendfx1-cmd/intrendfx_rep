import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const faqs = [
  {
    q: 'What is inTrendFX?',
    a: 'inTrendFX is a global online forex and CFD brokerage. We offer live trading accounts across 60+ instruments — forex, metals, indices, commodities, and crypto CFDs — with tight spreads, fast execution, and tier-1 liquidity.',
  },
  {
    q: 'Is inTrendFX regulated?',
    a: 'Yes. inTrendFX operates under FCA and CySEC oversight. Client funds are held in segregated tier-1 bank accounts, with negative balance protection and investor compensation cover where applicable.',
  },
  {
    q: 'Which instruments can I trade?',
    a: '60+ instruments across forex (majors, minors, exotics), metals (gold, silver), global indices (US30, NAS100, GER40, UK100, JP225), commodities (WTI, brent, natural gas), and crypto CFDs (BTC, ETH, SOL, XRP).',
  },
  {
    q: 'What are the spreads and commissions?',
    a: 'Spreads start from 1.2 pips on Standard accounts with zero commission, 0.6 pips on Pro, and 0.0 pips raw on ECN with a flat $3.5 per lot per side. All pricing is fully transparent and shown live in the platform.',
  },
  {
    q: 'How do deposits and withdrawals work?',
    a: 'Deposit and withdraw using Visa, Mastercard, bank wire, Skrill, Neteller, or crypto in USD, EUR, GBP, or USDT. Most withdrawals are processed the same day with no hidden fees.',
  },
  {
    q: 'Do you offer a demo account?',
    a: 'Yes. Open a free demo account in under 60 seconds and practise with virtual funds on the exact same pricing and execution as our live environment.',
  },
  {
    q: 'What is the maximum leverage?',
    a: 'Up to 1:500 on major forex pairs, 1:200 on metals, 1:100 on indices and commodities, and 1:20 on crypto CFDs. Leverage is shown per instrument in the platform.',
  },
  {
    q: 'Can I run Expert Advisors (EAs) and copy trade?',
    a: 'Yes. MT4 and MT5 fully support EAs, scalping, hedging, and high-frequency strategies. Copy trading is available through our integrated social trading feed.',
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 mb-3 ${
        isOpen
          ? 'border-[#0158c6] bg-[rgba(1,88,198,0.03)]'
          : 'border-[#E8EAF0] bg-white hover:border-[rgba(1,88,198,0.3)]'
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        onClick={onToggle}
      >
        <span className={`text-sm sm:text-base font-semibold font-manrope transition-colors ${isOpen ? 'text-[#0158c6]' : 'text-[#0D0F1A]'}`}>
          {faq.q}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-[#0158c6]' : 'text-[#6B7080]'}`}
        />
      </button>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.4s ease, opacity 0.3s ease',
        }}
      >
        <div className="px-5 pb-4">
          <div className="h-px bg-[rgba(1,88,198,0.15)] mb-3" />
          <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const { ref: headerRef } = useScrollAnimation();
  const { ref: contentRef } = useScrollAnimation(0.1);

  return (
    <section className="bg-white py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Two-column layout */}
        <div ref={headerRef} className="scroll-reveal grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">

          {/* LEFT — Heading (1/3) */}
          <div className="lg:col-span-1">
            <h2
              className="font-extrabold text-[#0D0F1A] tracking-[-0.02em] font-manrope mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Frequently Asked{' '}
              <span className="text-[#0158c6]">Questions</span>
            </h2>
            <p className="text-base sm:text-lg text-[#6B7080] font-light">
              Everything you need to know before you start.
            </p>
          </div>

          {/* RIGHT — FAQ accordion (2/3) */}
          <div ref={contentRef} className="scroll-reveal lg:col-span-2">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
