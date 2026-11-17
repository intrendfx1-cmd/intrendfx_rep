import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBanner from './TopBanner';
import '../landing.css';

const BRAND_GRADIENT =
  'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)';

/**
 * Shared landing template for instrument / account / company / education pages.
 *
 * Sections (in order, all preserved across pages so the rhythm matches the
 * Platforms pages):
 *   1. Hero        — eyebrow, headline, subtitle, two CTAs, aesthetic image card
 *   2. Features    — 4-card grid (icon + title + desc)
 *   3. 2-col block — image card + headline + body + green-tick checklist
 *   4. CTA banner  — gradient rounded card with white pill button
 *
 * Pass `config` shaped like:
 *   {
 *     eyebrow, titleStart, titleHighlight, titleEnd?, subtitle,
 *     primaryCta: { label, to }, secondaryCta: { label, to },
 *     heroImage: { src, alt, statusLabel, statusNote },
 *     features: [{ icon, title, desc }],
 *     splitSection: { image, alt, eyebrow, titleStart, titleHighlight, body, checklist? },
 *     cta: { title, body, button, buttonTo }
 *   }
 */
export default function SimpleLandingPage({ config }) {
  const c = config;

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
              {c.eyebrow}
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
              {c.titleStart}{' '}
              <span
                style={{
                  background: BRAND_GRADIENT,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                {c.titleHighlight}
              </span>
              {c.titleEnd ? <> {c.titleEnd}</> : null}
            </h1>
            <p className="text-base sm:text-lg text-[#6B7080] mb-8 leading-relaxed max-w-xl">
              {c.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={c.primaryCta.to}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm shadow-[0_6px_20px_rgba(1,88,198,0.3)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(77,190,81,0.4)] transition-all"
                style={{ background: BRAND_GRADIENT }}
              >
                {c.primaryCta.label} <ArrowRight size={16} />
              </Link>
              {c.secondaryCta && (
                <Link
                  to={c.secondaryCta.to}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-[#4dbe51] text-[#4dbe51] font-semibold text-sm hover:bg-[#4dbe51] hover:text-white transition-all"
                >
                  {c.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>

          {/* Aesthetic image card with gradient halo */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
              style={{ background: BRAND_GRADIENT }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(1,88,198,0.18)] border border-[#E8EAF0] bg-white">
              <img
                src={c.heroImage.src}
                alt={c.heroImage.alt}
                className="w-full h-auto block aspect-[4/3] object-cover"
                loading="lazy"
              />
              <div className="px-5 py-4 border-t border-[#E8EAF0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#0D0F1A]">{c.heroImage.statusLabel}</span>
                </div>
                <span className="text-xs text-[#6B7080]">{c.heroImage.statusNote}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────────── */}
      {c.features?.length > 0 && (
        <section className="py-16 md:py-24 px-6 bg-[#FAFBFD]">
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
                {c.featuresTitleStart || 'Built for '}
                <span style={{ color: '#0158c6' }}>
                  {c.featuresTitleHighlight || 'Real Traders'}
                </span>
              </h2>
              {c.featuresSubtitle && (
                <p className="mt-3 text-base text-[#6B7080] max-w-2xl mx-auto">{c.featuresSubtitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {c.features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="bg-white border border-[#E8EAF0] rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:border-[#0158c6] hover:shadow-[0_8px_30px_rgba(1,88,198,0.1)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: 'rgba(1,88,198,0.08)', color: '#0158c6' }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-[#0D0F1A] font-manrope mb-2">{f.title}</h3>
                    <p className="text-sm text-[#6B7080] leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SPLIT (image + checklist) ──────────────────────────────────────── */}
      {c.splitSection && (
        <section className="py-16 md:py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl"
                style={{ background: BRAND_GRADIENT }}
              />
              <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(13,15,26,0.14)] border border-[#E8EAF0] bg-white">
                <img
                  src={c.splitSection.image}
                  alt={c.splitSection.alt}
                  className="w-full h-auto block aspect-[5/4] object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              {c.splitSection.eyebrow && (
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: '#0158c6' }}
                >
                  {c.splitSection.eyebrow}
                </p>
              )}
              <h2
                className="text-[#0D0F1A] mb-5 font-manrope"
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                {c.splitSection.titleStart}{' '}
                <span style={{ color: '#0158c6' }}>{c.splitSection.titleHighlight}</span>
              </h2>
              {c.splitSection.body && (
                <p className="text-base text-[#6B7080] mb-7 leading-relaxed">{c.splitSection.body}</p>
              )}
              {c.splitSection.checklist?.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
                  {c.splitSection.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#0D0F1A]">
                      <CheckCircle2 size={18} className="text-[#4dbe51] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      {c.cta && (
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
                {c.cta.title}
              </h2>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto mb-8">{c.cta.body}</p>
              <Link
                to={c.cta.buttonTo}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0158c6] font-semibold text-sm hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-all"
              >
                {c.cta.button} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
