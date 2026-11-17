import { ArrowRight, BookOpen, Shield, BarChart2, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation, useStaggerAnimation } from '../hooks/useScrollAnimation';

// §E — Trader Academy
// Insertion: after Testimonials (§16).
// Wrapper pattern cloned from Education.jsx 4-card grid (dark background).

const courses = [
  { icon: BookOpen,  title: 'Forex Foundations',     desc: 'Pair mechanics, order types, and session dynamics.',                  lessons: '12 lessons'  },
  { icon: Shield,    title: 'Risk & Psychology',      desc: 'Position sizing, drawdown control, and trader mindset.',              lessons: '8 lessons'   },
  { icon: BarChart2, title: 'Technical Mastery',      desc: 'Price action, multi-timeframe analysis, and confluence trading.',     lessons: '14 lessons'  },
  { icon: Video,     title: 'Live Market Briefings',  desc: 'Daily morning briefing covering the London open.',                    lessons: 'Free for clients' },
];

export default function TraderAcademy() {
  const { ref: headerRef } = useScrollAnimation();
  const cardsRef = useStaggerAnimation(0.08, 90);

  return (
    <section className="bg-[#0C0C1D] py-14 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="scroll-reveal mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(1,88,198,0.15)] border border-[rgba(1,88,198,0.3)] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0158c6]" />
            <span className="text-xs font-semibold text-[#0158c6] uppercase tracking-widest">Education Center</span>
          </div>
          <h2
            className="font-extrabold text-white tracking-[-0.02em] font-manrope mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            inTrendFX <span className="text-[#0158c6]">Trader Academy</span>
          </h2>
          <p className="text-base sm:text-lg text-[#9AA0B4] font-light">
            Sharpen your edge with structured learning paths designed by professional traders.
          </p>
        </div>

        {/* Course Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {courses.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="stagger-child bg-[#141428] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 group flex flex-col gap-4 hover:border-[rgba(1,88,198,0.4)] transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-[rgba(1,88,198,0.1)] border border-[rgba(1,88,198,0.2)] self-start">
                  <Icon size={20} className="text-[#0158c6]" />
                </div>
                <h3 className="text-base font-semibold text-white font-manrope leading-snug group-hover:text-[#0158c6] transition-colors">
                  {c.title}
                </h3>
                <p className="text-sm text-[#9AA0B4] leading-relaxed flex-1">{c.desc}</p>
                <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#0158c6] uppercase tracking-wider">
                  {c.lessons}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[rgba(255,255,255,0.15)] text-white font-semibold text-sm hover:border-[#0158c6] hover:text-[#0158c6] transition-all"
          >
            Browse the Academy <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
