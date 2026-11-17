import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Globe2,
  Clock,
  Coins,
  LineChart,
  Bitcoin,
  CircleDollarSign,
  Zap,
  Target,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import '../landing.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)';

/* ── Forex markets you can trade in every challenge ──────────────────────── */
const forexMarkets = [
  {
    icon: CircleDollarSign,
    name: 'Major Pairs',
    count: '7 pairs',
    items: 'EUR/USD · GBP/USD · USD/JPY · USD/CHF · AUD/USD · USD/CAD · NZD/USD',
    spread: 'From 0.1 pips',
  },
  {
    icon: Globe2,
    name: 'Minor Pairs',
    count: '20+ crosses',
    items: 'EUR/GBP · EUR/JPY · GBP/JPY · AUD/JPY · CHF/JPY · EUR/AUD',
    spread: 'From 0.5 pips',
  },
  {
    icon: TrendingUp,
    name: 'Exotic Pairs',
    count: '15+ pairs',
    items: 'USD/TRY · USD/ZAR · USD/MXN · USD/SGD · USD/HKD · EUR/TRY',
    spread: 'From 2.0 pips',
  },
  {
    icon: Coins,
    name: 'Metals',
    count: 'Spot + CFDs',
    items: 'XAU/USD (Gold) · XAG/USD (Silver) · XPT/USD · XPD/USD',
    spread: 'From 0.15 pips',
  },
  {
    icon: LineChart,
    name: 'Global Indices',
    count: '12 indices',
    items: 'US30 · NAS100 · SPX500 · GER40 · UK100 · JP225 · HK50',
    spread: 'From 0.5 points',
  },
  {
    icon: Bitcoin,
    name: 'Crypto CFDs',
    count: '24/7 markets',
    items: 'BTC/USD · ETH/USD · SOL/USD · XRP/USD · ADA/USD · DOGE/USD',
    spread: 'From 8 pips',
  },
];

/* ── Forex trading sessions ─────────────────────────────────────────────── */
const sessions = [
  {
    name: 'Sydney',
    hours: '22:00 – 07:00 UTC',
    pairs: 'AUD, NZD, JPY pairs',
    accent: '#0158c6',
  },
  {
    name: 'Tokyo',
    hours: '00:00 – 09:00 UTC',
    pairs: 'JPY pairs, AUD/JPY, USD/JPY',
    accent: '#0199c6',
  },
  {
    name: 'London',
    hours: '07:00 – 16:00 UTC',
    pairs: 'EUR, GBP majors, XAU/USD',
    accent: '#4dbe51',
  },
  {
    name: 'New York',
    hours: '12:00 – 21:00 UTC',
    pairs: 'USD majors, indices, crypto',
    accent: '#81ce65',
  },
];

/* ── Map admin Challenge docs → promo/perk structure (brokerage promos) ─── */
function buildPhases(c) {
  const r = c.rules || {};
  const fmtPct = (v) => (v == null || v === '' ? null : `${v}%`);
  const fmtDays = (v) => (v == null || v === '' ? null : `${v} days`);
  const fmtBool = (v) => (v ? 'Eligible' : 'Not eligible');

  const baseRules = (target) => [
    target ? { key: 'Bonus Amount', value: target } : null,
    fmtPct(r.maxDailyDrawdownPercent) && {
      key: 'Min Deposit',
      value: `$${r.maxDailyDrawdownPercent * 100}`,
    },
    fmtPct(r.maxOverallDrawdownPercent) && {
      key: 'Max Bonus',
      value: `$${r.maxOverallDrawdownPercent * 100}`,
    },
    r.maxOneDayProfitPercentOfTarget != null && {
      key: 'Required Volume',
      value: `${r.maxOneDayProfitPercentOfTarget} lots`,
    },
    fmtDays(r.tradingDaysRequired) && {
      key: 'Eligibility Window',
      value: fmtDays(r.tradingDaysRequired),
    },
    fmtDays(r.challengeExpiryDays) && {
      key: 'Promo Expires In',
      value: fmtDays(r.challengeExpiryDays),
    },
    { key: 'New clients', value: fmtBool(r.allowNewsTrading) },
  ].filter(Boolean);

  if (c.stepsCount === 2) {
    return [
      { label: 'Tier 1 — Welcome', rules: baseRules(fmtPct(r.profitTargetPhase1Percent)) },
      { label: 'Tier 2 — Top-up', rules: baseRules(fmtPct(r.profitTargetPhase2Percent)) },
    ];
  }
  if (c.stepsCount === 1) {
    return [{ label: 'Single tier', rules: baseRules(fmtPct(r.profitTargetPhase1Percent)) }];
  }
  return [{ label: 'Instant credit on deposit', rules: baseRules(fmtPct(r.profitTargetInstantPercent)) }];
}

function challengeTagline(c) {
  if (c.stepsCount === 0) return 'Instant bonus credited the moment you deposit.';
  if (c.stepsCount === 1) return 'Single-tier campaign. Deposit, trade, claim.';
  return 'Two-tier campaign with stacked rewards for active clients.';
}

/* ── Promotion comparison rows (static, marketing-style) ────────────────── */
const comparisonRows = [
  { feature: 'Promo type', instant: 'Welcome Bonus', step1: 'Deposit Bonus', step2: 'Cashback Campaign' },
  { feature: 'Min deposit', instant: '$100', step1: '$250', step2: '$500' },
  { feature: 'Bonus / reward', instant: '15% credit', step1: 'Up to 50% credit', step2: '$5 / lot cashback' },
  { feature: 'Required volume', instant: 'None', step1: '5 lots', step2: '10+ lots' },
  { feature: 'Eligibility', instant: 'New clients', step1: 'New & existing', step2: 'All clients' },
  { feature: 'Withdrawal of bonus', instant: 'After 1 lot', step1: 'After 5 lots', step2: 'Anytime' },
  { feature: 'Promo expires', instant: '30 days', step1: '30 days', step2: 'Ongoing' },
  { feature: 'Account types', instant: 'All', step1: 'All', step2: 'All' },
  { feature: 'EAs & copy trading', instant: 'Allowed', step1: 'Allowed', step2: 'Allowed' },
  { feature: 'Loyalty tier boost', instant: '—', step1: '+1 tier', step2: '+2 tiers' },
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/prop/challenges`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.challenges)) {
          const order = { 0: 0, 1: 1, 2: 2 };
          const sorted = [...data.challenges].sort(
            (a, b) => (order[a.stepsCount] ?? 9) - (order[b.stepsCount] ?? 9)
          );
          setChallenges(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 inline-flex items-center gap-2"
            style={{
              background: BRAND_GRADIENT,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            <Target size={14} style={{ color: '#4dbe51' }} />
            Promotions & Bonus Campaigns
          </p>
          <h1
            className="text-[#0D0F1A] mb-6"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            Boost your account with{' '}
            <span
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              welcome bonuses & cashback
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed mb-8">
            Three live promotions for inTrendFX clients. Welcome bonus on your first deposit,
            stacked deposit bonuses, and ongoing cashback rebates on every lot traded across
            60+ forex pairs, metals, indices, and crypto.
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {[
              '60+ Forex Pairs',
              '24/5 Markets',
              'Instant Withdrawals',
              'USD Wallet',
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border bg-white"
                style={{
                  borderColor: 'rgba(77,190,81,0.3)',
                  color: '#0158c6',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
            style={{ background: BRAND_GRADIENT }}
          >
            View Pricing <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Forex Markets You Can Trade ─────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Tradable Markets —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              What You'll{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Trade
              </span>{' '}
              on Every Account
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              All instruments are unlocked from day one. No premium upgrades, no
              hidden tiers — every account gets the full inTrendFX market list.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {forexMarkets.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.name}
                  className="rounded-2xl bg-white p-6 border border-[#E8EAF0] hover:border-[#4dbe51] hover:shadow-[0_8px_30px_rgba(77,190,81,0.12)] transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(77,190,81,0.12)' }}
                    >
                      <Icon size={20} style={{ color: '#4dbe51' }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0D0F1A] font-manrope">
                        {m.name}
                      </h3>
                      <p className="text-xs text-[#0158c6] font-semibold">{m.count}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#6B7080] leading-relaxed mb-3 min-h-[42px]">
                    {m.items}
                  </p>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E8EAF0]">
                    <span className="text-[#6B7080]">Spreads</span>
                    <span className="font-bold text-[#0D0F1A]">{m.spread}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live Challenges (API-driven) ────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Active Promotions —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Choose Your{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Bonus Campaign
              </span>
            </h2>
          </div>

          <div className="space-y-6">
            {loading && (
              <div className="text-center text-[#6B7080] py-10">Loading promotions…</div>
            )}
            {!loading && challenges.length === 0 && (
              <div className="text-center text-[#6B7080] py-10">
                No promotions available right now. Please check back soon.
              </div>
            )}
            {!loading &&
              challenges.map((c, idx) => {
                const phases = buildPhases(c);
                return (
                  <div
                    key={c._id || c.name}
                    className={`rounded-2xl overflow-hidden border ${
                      idx === 0
                        ? 'border-[#4dbe51] shadow-[0_8px_40px_rgba(77,190,81,0.18)]'
                        : 'border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    {/* Header */}
                    <div className="px-6 sm:px-10 py-8 bg-[#FAFBFD] border-b border-[#E8EAF0]">
                      <div className="flex flex-wrap items-baseline gap-3 mb-2">
                        <h3
                          className="text-2xl sm:text-3xl font-extrabold text-[#0D0F1A]"
                          style={{ letterSpacing: '-0.02em' }}
                        >
                          {c.name}
                        </h3>
                        <span
                          className="text-sm font-medium"
                          style={{ color: idx === 0 ? '#4dbe51' : '#0158c6' }}
                        >
                          {challengeTagline(c)}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-[#6B7080] leading-relaxed max-w-3xl">
                        {c.description ||
                          'Deposit, trade, and claim. Transparent bonus terms, USD wallet, no hidden conditions.'}
                      </p>
                    </div>

                    {/* Phases */}
                    <div className="divide-y divide-[#E8EAF0]">
                      {phases.map((phase) => (
                        <div key={phase.label} className="px-6 sm:px-10 py-6">
                          <p className="text-xs font-bold text-[#0158c6] uppercase tracking-widest mb-4">
                            {phase.label}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                            {phase.rules.map((rule) => (
                              <div key={rule.key}>
                                <p className="text-xs text-[#6B7080] mb-1">{rule.key}</p>
                                <p className="text-sm sm:text-base font-bold text-[#0D0F1A]">
                                  {rule.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="px-6 sm:px-10 py-5 bg-[#FAFBFD] border-t border-[#E8EAF0] flex flex-wrap gap-4 items-center justify-between">
                      <p className="text-sm text-[#6B7080]">
                        Ready to claim the {c.name.toLowerCase()} promotion?
                      </p>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-[0_4px_12px_rgba(1,88,198,0.25)] hover:shadow-[0_8px_24px_rgba(77,190,81,0.4)]"
                        style={{ background: BRAND_GRADIENT }}
                      >
                        See accounts <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── Trading Sessions ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3 inline-flex items-center gap-2">
              <Clock size={12} /> 24/5 Forex Schedule
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Trade Every{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Forex Session
              </span>
            </h2>
            <p className="text-base text-[#6B7080] max-w-2xl mx-auto mt-4">
              Markets open Sunday 22:00 UTC and run continuously until Friday 22:00 UTC.
              Pick your session, trade your edge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sessions.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl bg-white p-6 border border-[#E8EAF0] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] transition-all"
                style={{ borderTopWidth: '3px', borderTopColor: s.accent }}
              >
                <h3 className="text-xl font-bold text-[#0D0F1A] font-manrope mb-1">
                  {s.name}
                </h3>
                <p className="text-xs font-semibold mb-4" style={{ color: s.accent }}>
                  {s.hours}
                </p>
                <p className="text-xs text-[#6B7080] uppercase tracking-wider mb-1">
                  Best Pairs
                </p>
                <p className="text-sm text-[#0D0F1A] font-semibold">{s.pairs}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Challenge Comparison Table ──────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest mb-3">
              — Side by Side —
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Compare All{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Promotions
              </span>
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E8EAF0] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: BRAND_GRADIENT }} className="text-white">
                  <th className="text-left px-5 py-4 font-semibold">Feature</th>
                  <th className="text-center px-5 py-4 font-semibold">
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap size={14} /> Welcome
                    </div>
                  </th>
                  <th className="text-center px-5 py-4 font-semibold">
                    <div className="flex items-center justify-center gap-1.5">
                      <Target size={14} /> Deposit Bonus
                    </div>
                  </th>
                  <th className="text-center px-5 py-4 font-semibold">
                    <div className="flex items-center justify-center gap-1.5">
                      <Shield size={14} /> Cashback
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFD]'}
                  >
                    <td className="px-5 py-3.5 text-[#0D0F1A] font-medium">
                      {row.feature}
                    </td>
                    <td className="text-center px-5 py-3.5 text-[#6B7080]">
                      {row.instant}
                    </td>
                    <td className="text-center px-5 py-3.5 text-[#6B7080]">
                      {row.step1}
                    </td>
                    <td className="text-center px-5 py-3.5 text-[#6B7080]">
                      {row.step2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-center text-[#9AA0B4] mt-4">
            * Indicative numbers. Final terms per promotion are published in the live pricing page.
          </p>
        </div>
      </section>

      {/* ── Rules notes ─────────────────────────────────────────────────── */}
      <section className="py-14 md:py-20 px-6 bg-[#0C0C1D]">
        <div className="max-w-4xl mx-auto">
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
            className="text-white mb-3 text-center font-manrope"
          >
            A few things you should know
          </h2>
          <p className="text-base text-[#9AA0B4] text-center max-w-2xl mx-auto mb-10">
            Short read. Long savings — these are the promotion-specific terms that
            trip up most clients if they don't read first.
          </p>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                t: 'Welcome bonus eligibility',
                d: 'Welcome bonuses are available to new clients only. Your account must be fully KYC-verified before any bonus credit is released. The same client cannot claim the welcome bonus twice across multiple accounts.',
              },
              {
                t: 'Minimum trading volume',
                d: 'Most promotions require a minimum number of standard lots traded before the bonus becomes withdrawable. The required volume is shown on each promotion card and in your client area.',
              },
              {
                t: 'Bonus credit vs profits',
                d: 'Bonus credit cannot be withdrawn directly — only profits earned from trading with the bonus can be withdrawn. Once you meet the volume requirement, both the bonus and any profits become available.',
              },
              {
                t: 'Cashback rebates',
                d: 'Cashback rebates are credited daily based on your previous day\'s trading volume and your current loyalty tier. Rebates are paid in your account base currency and are immediately withdrawable.',
              },
              {
                t: 'News trading is fully allowed',
                d: 'Hold trades through NFP, CPI, FOMC, ECB, BoE, BoJ — any release is fair game with no window restrictions. EAs, scalping, and hedging are all permitted under every promotion.',
              },
              {
                t: 'Weekend & overnight holds',
                d: 'Forex closes Friday 22:00 UTC and reopens Sunday 22:00 UTC — positions held over the weekend are allowed under every promotion. Swap charges apply per pair (swap-free Islamic accounts excluded).',
              },
            ].map((item) => (
              <div
                key={item.t}
                className="border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 sm:p-6 bg-[#141428] hover:border-[#4dbe51] transition-colors"
              >
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: '#4dbe51' }} />
                  {item.t}
                </h3>
                <p className="text-sm text-[#9AA0B4] leading-relaxed pl-6">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 md:py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'rgba(77,190,81,0.1)', color: '#4dbe51' }}
          >
            <TrendingUp size={14} />
            Use code INTREND15 — 15% deposit bonus for new clients
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
            className="text-[#0D0F1A] mb-5 font-manrope"
          >
            Made up your mind?
          </h2>
          <p className="text-base sm:text-lg text-[#6B7080] mb-8">
            Head over to pricing, pick an account type, and claim your bonus on
            your first deposit.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              View Pricing <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
            >
              Try Free Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
