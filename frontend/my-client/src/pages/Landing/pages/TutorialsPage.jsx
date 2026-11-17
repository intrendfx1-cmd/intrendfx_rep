import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Smartphone,
  Target,
  Compass,
  LineChart,
  Layers,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import '../landing.css';

const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)';

const LEVEL_STYLES = {
  Beginner:      { color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
  Intermediate:  { color: '#0158c6', bg: 'rgba(1,88,198,0.10)' },
  Advanced:      { color: '#a855f7', bg: 'rgba(168,85,247,0.10)' },
};

const courses = [
  {
    title: 'Forex Basics 101',
    level: 'Beginner',
    blurb:
      "If you've never placed a forex trade in your life, start here. We walk you through how the market actually works — currency pairs, pips, lots, order types — without the jargon that scares most beginners off.",
    duration: '2 hours',
    lessons: '12 modules',
    topics: [
      'Introduction to forex markets',
      'Currency pairs explained',
      'Understanding pips & lots',
      'Market sessions',
      'Basic trading strategies',
      'Risk management fundamentals',
    ],
    cta: 'Start Learning',
  },
  {
    title: 'Technical Analysis Masterclass',
    level: 'Intermediate',
    blurb:
      "Charts make a lot more sense once someone shows you what to actually look at. This course covers the patterns, indicators and price-action setups our own traders rely on every day.",
    duration: '4 hours',
    lessons: '20 modules',
    topics: [
      'Candlestick patterns',
      'Support & resistance',
      'Trend analysis',
      'Technical indicators',
      'Chart patterns',
      'Trading signals',
    ],
    cta: 'Start Learning',
  },
  {
    title: 'Risk Management & Trading Psychology',
    level: 'Intermediate',
    blurb:
      "Most traders don't blow up because of bad analysis — they blow up because they can't manage their risk or their emotions. This is the course nobody puts first, but probably should.",
    duration: '3 hours',
    lessons: '15 modules',
    topics: [
      'Risk-to-reward ratios',
      'Position sizing',
      'Emotional discipline',
      'Trading plans',
      'Managing losses',
      'Performance improvement',
    ],
    cta: 'Start Learning',
  },
  {
    title: 'Algorithmic & Copy Trading',
    level: 'Advanced',
    blurb:
      "Already comfortable with manual trading? This one's about scaling — building EAs, copy-trading setups and portfolio approaches that let your edge run while you sleep.",
    duration: '5 hours',
    lessons: '25 modules',
    topics: [
      'Trading automation',
      'Expert Advisors (EAs)',
      'Copy trading systems',
      'Strategy development',
      'Portfolio diversification',
      'Performance monitoring',
    ],
    cta: 'Start Learning',
  },
];

const whyCards = [
  {
    icon: GraduationCap,
    title: 'Real traders, not academics',
    desc:
      "Every lesson is built by people who actively trade — not lecturers reading from a textbook. You get the stuff that actually matters on a live chart.",
  },
  {
    icon: Smartphone,
    title: 'Watch wherever you are',
    desc:
      "Pull up a lesson on your phone during a commute, finish it on your laptop at home. Your progress syncs across every device.",
  },
  {
    icon: Target,
    title: 'Practice while you learn',
    desc:
      "Every concept connects back to your demo account. Read it, watch it, then go test it — without risking a single dollar.",
  },
];

const resourceCards = [
  {
    icon: Compass,
    title: 'Beginner Learning Path',
    desc:
      'A step-by-step roadmap for new traders. We tell you what to study first, second and third — so you don\'t waste weeks figuring out where to start.',
  },
  {
    icon: LineChart,
    title: 'Market Analysis Guides',
    desc:
      'Practical guides on reading the markets — how to spot setups, when to wait, and how to build a real opinion instead of just guessing.',
  },
  {
    icon: Layers,
    title: 'Platform Tutorials',
    desc:
      'Short, focused walkthroughs of the inTrendFX Web Platform, copy trading tools, account management, deposits and withdrawals.',
  },
  {
    icon: Sparkles,
    title: 'Strategy Development',
    desc:
      'Learn how to build, test, and refine a trading strategy using real backtesting tools, journaling templates, and proven frameworks.',
  },
];

const benefits = [
  'Structured learning programs',
  'Beginner to advanced content',
  'Practical trading examples',
  'Self-paced learning',
  'Platform-specific tutorials',
  'Market analysis techniques',
  'Trading psychology training',
  'Risk management education',
  'Mobile-friendly access',
  'Continuous learning resources',
];

export default function TutorialsPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p
              className="text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 inline-flex items-center gap-2"
              style={{ color: '#0158c6' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
              Education · Tutorials
            </p>
            <h1
              className="text-[#0D0F1A] mb-5 font-manrope"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
              }}
            >
              Trading{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Tutorials
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#6B7080] mb-4 leading-relaxed max-w-xl">
              Learn the markets at your own pace, with lessons built by traders who actually
              trade. No fluff, no academic theory — just the stuff that actually matters on a
              live chart.
            </p>
            <p className="text-sm text-[#6B7080] mb-8 leading-relaxed max-w-xl">
              Whether you're starting from zero or sharpening an existing edge, our courses, guides
              and walkthroughs are structured so you can learn anywhere, anytime — on desktop,
              tablet or mobile.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
                style={{ background: BRAND_GRADIENT }}
              >
                Browse Courses <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
              >
                Open Demo Account
              </Link>
            </div>
          </div>

          {/* Aesthetic hero image */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(1,88,198,0.18)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80"
                alt="Trader watching a tutorial"
                className="w-full h-auto block aspect-[4/3] object-cover"
                loading="lazy"
              />
              <div className="px-5 py-4 border-t border-[#E8EAF0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#0D0F1A]">120+ lessons available</span>
                </div>
                <span className="text-xs text-[#6B7080]">Free for clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0158c6' }}>
              The Library
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Featured <span style={{ color: '#0158c6' }}>Courses</span>
            </h2>
            <p className="mt-3 text-base text-[#6B7080] max-w-2xl mx-auto">
              Four flagship courses that cover the lifecycle of becoming a real trader — start
              with what fits your level.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((c) => {
              const lvl = LEVEL_STYLES[c.level] || LEVEL_STYLES.Intermediate;
              return (
                <div
                  key={c.title}
                  className="bg-white border border-[#E8EAF0] rounded-2xl p-7 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-[#0D0F1A] font-manrope leading-snug">
                      {c.title}
                    </h3>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0"
                      style={{ color: lvl.color, background: lvl.bg }}
                    >
                      {c.level}
                    </span>
                  </div>

                  {/* Blurb */}
                  <p className="text-sm text-[#6B7080] leading-relaxed mb-5">{c.blurb}</p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-3 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F7FB] text-xs font-semibold text-[#0D0F1A]">
                      <Clock size={13} className="text-[#0158c6]" />
                      {c.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F7FB] text-xs font-semibold text-[#0D0F1A]">
                      <BookOpen size={13} className="text-[#0158c6]" />
                      {c.lessons}
                    </span>
                  </div>

                  {/* Topics */}
                  <div className="mb-6 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B7080] mb-3">
                      What you'll cover
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
                      {c.topics.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-xs sm:text-sm text-[#0D0F1A]">
                          <CheckCircle2 size={15} className="text-[#4dbe51] shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm w-full sm:w-auto self-start hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(1,88,198,0.3)] transition-all"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    {c.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY LEARN WITH US ──────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Why Learn with <span style={{ color: '#0158c6' }}>inTrendFX?</span>
            </h2>
            <p className="mt-3 text-base text-[#6B7080] max-w-2xl mx-auto">
              We've put together the kind of course library we wish we'd had when we started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {whyCards.map((w) => {
              const Icon = w.icon;
              return (
                <div
                  key={w.title}
                  className="bg-white border border-[#E8EAF0] rounded-2xl p-7 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(1,88,198,0.08)', color: '#0158c6' }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-[#0D0F1A] font-manrope mb-2">{w.title}</h3>
                  <p className="text-sm text-[#6B7080] leading-relaxed">{w.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 transition-all"
              style={{ background: BRAND_GRADIENT }}
            >
              Browse All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ADDITIONAL RESOURCES ───────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#0158c6' }}>
              Beyond the courses
            </p>
            <h2
              className="text-[#0D0F1A] font-manrope"
              style={{
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Additional Learning <span style={{ color: '#0158c6' }}>Resources</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {resourceCards.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.title}
                  className="bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] hover:-translate-y-1 transition-all duration-300 flex gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(1,88,198,0.08)', color: '#0158c6' }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0D0F1A] font-manrope mb-1.5">{r.title}</h3>
                    <p className="text-sm text-[#6B7080] leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BENEFITS — 2 col with image ────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(13,15,26,0.14)] border border-[#E8EAF0] bg-white">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80"
                alt="inTrendFX education program"
                className="w-full h-auto block aspect-[5/4] object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: '#0158c6' }}
            >
              What you get
            </p>
            <h2
              className="text-[#0D0F1A] mb-5 font-manrope"
              style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              Benefits of inTrendFX{' '}
              <span style={{ color: '#0158c6' }}>Education</span>
            </h2>
            <p className="text-base text-[#6B7080] mb-7 leading-relaxed">
              The whole library is free for anyone with an inTrendFX account — live or demo. No
              upsells, no paywalls hiding the good stuff. You learn at your pace, on your own
              schedule, and come back whenever you need a refresher.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-[#0D0F1A]">
                  <CheckCircle2 size={18} className="text-[#4dbe51] shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-6 bg-[#FAFBFD]">
        <div
          className="max-w-5xl mx-auto rounded-3xl px-8 py-12 sm:px-12 sm:py-16 text-center relative overflow-hidden"
          style={{ background: BRAND_GRADIENT }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)',
            }}
          />
          <div className="relative">
            <h2
              className="text-white font-manrope mb-4"
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Start Your Trading Education Today
            </h2>
            <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-4">
              Pick up the knowledge, build the confidence, and develop the skills you need to
              navigate real markets — at your own pace.
            </p>
            <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto mb-8">
              Whether you're a complete beginner or an experienced trader sharpening your edge,
              the library is here when you're ready.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0158c6] font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-all"
              >
                Browse Courses <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white text-white font-semibold text-sm hover:bg-white hover:text-[#0158c6] transition-all"
              >
                Open Demo Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
