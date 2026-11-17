import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import PricingTierCard from '../components/PricingTierCard';
import '../landing.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Map admin stepsCount → tab name shown on the pricing page (brokerage account types).
const STEP_TO_TAB = { 0: 'Standard', 1: 'Pro', 2: 'ECN' };
const TAB_TO_STEP = { 'Standard': 0, 'Pro': 1, 'ECN': 2 };

// Static account-level features per type — these describe the *experience*
// (deposits, withdrawals, support) rather than per-tier numbers. Edit here if
// marketing copy changes.
const FEATURES_BY_TAB = {
  'Standard': [
    'Spreads from 1.2 pips, zero commission.',
    '60+ forex pairs, metals, indices, and crypto CFDs.',
    'Leverage up to 1:500 on majors.',
    'Withdraw in USD, EUR, GBP, or USDT — same business day.',
    'Live chat and email support, 24/5.'
  ],
  'Pro': [
    'Spreads from 0.6 pips, zero commission.',
    'Full instrument access — forex, metals, indices, crypto.',
    'Dedicated account manager from day one.',
    'Priority execution and faster withdrawals.',
    'Same-day VIP support response.'
  ],
  'ECN': [
    'Raw spreads from 0.0 pips, flat $3.5 per lot per side.',
    'Direct STP/ECN routing — no dealer intervention.',
    'Built for scalpers, algo traders, and pros.',
    'FIX API access available on request.',
    'Diamond loyalty tier with $5/lot cashback.'
  ]
};

const DESC_BY_TAB = {
  'Standard': 'Zero-commission account with spreads from 1.2 pips. Ideal for new and casual traders who want a simple, all-in pricing structure.',
  'Pro': 'Tighter spreads from 0.6 pips, zero commission, and a dedicated account manager. Built for active traders scaling up size.',
  'ECN': 'Raw interbank spreads from 0.0 pips with a flat $3.5 per lot per side. The choice of scalpers, algo traders, and professionals.'
};

const formatUSD = (n) => {
  if (n == null || isNaN(n)) return '';
  return '$' + Number(n).toLocaleString('en-US');
};

export default function PricingPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Standard');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/prop/challenges`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.challenges)) {
          setChallenges(data.challenges);
        }
      })
      .catch(() => { /* ignored — tabs render with empty tiers as a fallback */ })
      .finally(() => setLoading(false));
  }, []);

  // Pull WELCOME10 = 10% off from the top banner for the discounted price line
  // shown on each card. Coupon code text is intentionally hard-coded here so the
  // marketing card matches the banner copy without needing another admin field.
  const PROMO_CODE = 'INTREND15';
  const PROMO_DISCOUNT = 0.15;

  // Build { tabName: { description, tiers: [{ fundSize, challengeFee, popular, label, rules }], features } }
  // from live admin challenges. Each tier card needs both pricing (for the top
  // block) and the rule snapshot (for the quick rules list under the price), so
  // we attach the parent challenge's rules onto every tier — same plan, same rules.
  const plans = useMemo(() => {
    const out = {};
    for (const c of challenges) {
      const tabName = STEP_TO_TAB[c.stepsCount];
      if (!tabName) continue;
      const r = c.rules || {};
      const target = c.stepsCount === 0
        ? r.profitTargetInstantPercent
        : r.profitTargetPhase1Percent;
      const cardRules = [
        target != null && { key: 'Spread From', value: `${target} pips` },
        r.maxDailyDrawdownPercent != null && { key: 'Commission', value: `$${r.maxDailyDrawdownPercent} / lot` },
        r.maxOverallDrawdownPercent != null && { key: 'Max Leverage', value: `1:${r.maxOverallDrawdownPercent}` },
        r.tradingDaysRequired != null && { key: 'Cashback', value: `$${r.tradingDaysRequired} / lot` }
      ].filter(Boolean);

      const rawTiers = (c.tiers && c.tiers.length > 0)
        ? c.tiers
        : [{ fundSize: c.fundSize, challengeFee: c.challengeFee, isPopular: true, label: '' }];

      const tiers = rawTiers.map(t => ({
        fundSize: t.fundSize,
        challengeFee: t.challengeFee,
        capital: formatUSD(t.fundSize),
        price: formatUSD(t.challengeFee),
        discountedPrice: formatUSD(Math.round(t.challengeFee * (1 - PROMO_DISCOUNT))),
        popular: !!t.isPopular,
        label: t.label || '',
        rules: cardRules
      }));

      out[tabName] = {
        description: c.description || DESC_BY_TAB[tabName],
        tiers,
        features: FEATURES_BY_TAB[tabName]
      };
    }
    return out;
  }, [challenges]);

  const applyCoupon = () => {
    if (coupon.trim()) {
      setCouponApplied(true);
      setTimeout(() => setCouponApplied(false), 3000);
    }
  };

  // Always show all three tabs so users can see every plan type, even if the
  // admin hasn't published a challenge for one yet (we render an empty-state
  // message in that case instead of hiding the tab).
  const tabOrder = ['Standard', 'Pro', 'ECN'];
  const activePlan = plans[tab];

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Pricing</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Transparent pricing. <span className="text-[#0158c6]">No hidden fees.</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            We kept it simple. Pick an account type, fund from $100, trade. Spreads from 0.0 pips,
            leverage up to 1:500, and same-day withdrawals — no monthly charges.
          </p>
        </div>
      </section>

      {/* Tab switcher + Pricing */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto">
          {loading && (
            <div className="text-center text-[#6B7080] py-10">Loading pricing…</div>
          )}

          {!loading && (
            <>
              {/* Tabs — always render all three */}
              <div className="flex justify-center mb-8 md:mb-10">
                <div className="inline-flex bg-[#F0F2F8] border border-[#E8EAF0] rounded-full p-1 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  {tabOrder.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-6 sm:px-7 py-2.5 rounded-full text-sm font-bold transition-all ${
                        tab === t
                          ? 'bg-[#0158c6] text-white shadow-[0_4px_12px_rgba(1,88,198,0.35)]'
                          : 'text-[#0D0F1A] hover:text-[#0158c6]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-center text-base text-[#6B7080] max-w-2xl mx-auto mb-10 md:mb-12">
                {activePlan?.description || DESC_BY_TAB[tab]}
              </p>

              {activePlan ? (
                <>
                  {/* Tier Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {activePlan.tiers.map((tier) => (
                      <PricingTierCard key={tier.capital + '-' + tier.price} tier={tier} plan={tab} />
                    ))}
                  </div>

                  {/* What's included */}
                  <div className="bg-[#FAFBFD] border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
                    <h3 className="text-lg font-bold text-[#0D0F1A] mb-2">
                      What you get with {tab}
                    </h3>
                    <p className="text-sm text-[#6B7080] mb-5">Same across every deposit tier in this account type.</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activePlan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <Check size={16} className="text-[#0158c6] shrink-0 mt-0.5" />
                          <span className="text-sm text-[#6B7080]">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center bg-[#FAFBFD] border border-[#E8EAF0] rounded-2xl p-10 max-w-xl mx-auto">
                  <h3 className="text-lg font-bold text-[#0D0F1A] mb-2">{tab} accounts coming soon</h3>
                  <p className="text-sm text-[#6B7080]">
                    Our team is finalising the {tab} account tiers. In the meantime, explore the other account types above.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Coupon / Referral Section */}
      <section className="py-14 md:py-20 px-6 bg-[#0C0C1D]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.15)] border border-[rgba(1,88,198,0.3)] mb-5">
            <Tag size={14} className="text-[#0158c6]" />
            <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">Coupon code</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-white mb-4">
            Got a code from someone? <span className="text-[#0158c6]">Use it here.</span>
          </h2>
          <p className="text-base text-[#9AA0B4] mb-8 max-w-2xl mx-auto">
            If a creator, mentor, or trader friend shared their code, drop it in.
            You save on the fee, they get credited for the referral. Fair on both sides.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="ENTER CODE (e.g. INTREND15)"
                className="flex-1 px-5 py-3.5 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white text-sm placeholder-[#9AA0B4] focus:outline-none focus:border-[#0158c6] transition-all uppercase tracking-wider"
              />
              <button
                onClick={applyCoupon}
                className="px-6 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all shrink-0"
              >
                Apply
              </button>
            </div>
            {couponApplied && (
              <p className="text-sm text-emerald-400 mt-3">
                Got it. "{coupon}" will show up at checkout.
              </p>
            )}
            <p className="text-xs text-[#9AA0B4] mt-4">
              Codes are checked at checkout. We pay our partners every month, on time.
            </p>
          </div>
        </div>
      </section>

      {/* Become an Affiliate / Influencer */}
      <section className="py-14 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
            Run a trading channel or mentor traders?
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] mb-8 max-w-2xl mx-auto">
            We work with creators and educators worldwide. You get your own code, a dashboard
            to see who signed up, and a payout every month. No paperwork drama.
          </p>
          <Link to="/contact-us" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:bg-[#0199c6] transition-all">
            Talk to us <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-[#6B7080] mt-4">Usually replies within a day.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
