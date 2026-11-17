import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import '../landing.css';

const posts = [
  {
    slug: 'how-forex-brokers-work',
    category: 'Forex Basics',
    title: 'How Online Forex Brokers Work — A Complete Guide',
    excerpt: 'An online forex broker gives retail clients access to the global currency markets through tier-1 liquidity. The broker quotes a bid and ask, routes your order to the market, and earns a small spread or commission per trade.',
    body: [
      'An online forex broker is a regulated financial company that gives retail clients direct access to the global currency markets. Instead of trading through a bank, you open an account with the broker, deposit funds, and place trades through their platform — typically MetaTrader 4, MetaTrader 5, or a proprietary web platform.',
      'The way pricing works is simple. The broker aggregates quotes from multiple tier-1 liquidity providers (large banks and prime brokers) and shows you the best available bid and ask. The gap between bid and ask is the spread, and that is one way the broker earns revenue. On ECN accounts you pay raw spread plus a flat per-lot commission instead.',
      'For retail traders, a good broker solves three problems at once. First, access — you cannot trade EUR/USD or XAU/USD directly with a tier-1 bank as a retail client. Second, leverage — brokers extend regulated leverage so you can take a $100,000 EUR/USD position with a few hundred dollars of margin. Third, execution speed — modern brokers fill orders in under 30 milliseconds, which matters enormously for short-term traders.',
      'At inTrendFX, every order is routed to live liquidity. We are regulated by the FCA and CySEC, client funds are held in segregated tier-1 bank accounts, and trades are executed STP/ECN with no dealer intervention. You see the same prices the institutional desks see, with a small, fully transparent markup or commission depending on your account type.',
    ],
    readTime: '8 min read',
    date: 'April 22, 2026',
  },
  {
    slug: 'risk-management-forex-traders',
    category: 'Risk Management',
    title: 'Best Risk Management Practices for Forex Traders',
    excerpt: 'The traders who survive long enough to compound their accounts are not the ones with the best entries. They are the ones who never let a single trade ruin their week. Risk management is the only edge that compounds.',
    body: [
      'Every long-term profitable trader will tell you the same thing: the goal is not to make the most money on a winning day. The goal is to lose the least on a losing day. Position sizing and stop placement exist for a reason, and the traders who respect them are the ones who survive.',
      'The first rule we recommend is the 1% rule. Never risk more than 1% of your account on a single trade. On a $10,000 account, that is $100 of risk. If your stop-loss is 20 pips away on EUR/USD, that math forces a smaller position size — which is exactly the point.',
      'The second rule is the daily loss cap. Pick a number — 3% of your account is a reasonable starting point — and the moment you hit it, you stop trading for the day. Hard rule, no exceptions. Most blowups come from a single bad day where one losing trade turns into five revenge trades.',
      'The third — and least talked about — rule is correlation exposure. Never load up on positions that move together. Going long EUR/USD, GBP/USD, and AUD/USD at the same time is one big bet on USD weakness, not three diversified trades. One bad CPI print and all three move against you. Trade one clean idea well.',
      'Risk management is boring. That is the entire point. Boring traders compound. Exciting traders blow up.',
    ],
    readTime: '10 min read',
    date: 'April 18, 2026',
  },
  {
    slug: 'why-traders-blow-accounts',
    category: 'Trader Psychology',
    title: 'Common Reasons Retail Traders Blow Their Accounts',
    excerpt: 'After watching thousands of client accounts, the same patterns keep showing up. Most blowups have nothing to do with strategy. They are mistakes of impatience, oversizing, and ignoring basic rules.',
    body: [
      'We see thousands of client accounts on the platform. After observing hundreds of blowups, the patterns are remarkably consistent. The vast majority of retail traders lose for one of five reasons — and almost none of them involve a bad strategy.',
      'Reason one: oversizing. A trader gets two losses in a row, doubles their position size to "make it back," and loses a quarter of their account on the third trade. This is the single most common failure mode. The fix is mechanical — your position size is locked at the start of the day, and you do not change it until the next session.',
      'Reason two: revenge trading. After a losing trade, the trader immediately enters another trade without setup confirmation. Their next move is emotional, not technical. By the third revenge trade, they have lost more than they should ever risk in a week. The fix is to walk away from the screen for 30 minutes after any loss bigger than 1%.',
      'Reason three: ignoring session rhythms. The forex market has distinct character across the Sydney, Tokyo, London, and New York windows. Asia is range-bound, London opens with momentum, the London/NY overlap is the liquidity peak, and late NY drifts. Traders who try to scalp during the Asia lunch dead zone almost always overtrade and lose to spread and noise.',
      'Reason four: trading without a plan. We see clients open positions with no stop-loss, no target, and no reason beyond "it looks like it is going up." A trade without a written plan is a gamble. The fix is a one-line trade log before every entry: pair, direction, entry, stop, target, reason.',
      'Reason five: chasing news events. NFP, CPI, FOMC, ECB — these are not days for casual trading. The volatility looks like opportunity but is actually a tax on traders who think they can predict the unpredictable. Stay flat or trade tiny size.',
    ],
    readTime: '11 min read',
    date: 'April 14, 2026',
  },
  {
    slug: 'how-withdrawals-work',
    category: 'Withdrawals',
    title: 'How Withdrawals Work at inTrendFX',
    excerpt: 'You made profits and want to withdraw. Here is exactly how the process works — verification, processing time, available methods, and how the money gets to your account. No marketing fluff, just the actual workflow.',
    body: [
      'The withdrawal process at inTrendFX is designed to be fast, transparent, and free of surprises. The moment you request a withdrawal in the dashboard, the process moves through four clear stages.',
      'Stage one is identity verification, which only happens once. We need a valid government-issued photo ID (passport or national ID) and proof of address (utility bill or bank statement, dated within the last three months). This usually takes 24 to 48 hours. We do this digitally — no in-person meeting, no notarisation, nothing complicated. Once verified, your KYC stays on file for all future withdrawals.',
      'Stage two is the same-source rule. Regulation requires that withdrawals are sent back to the original funding source. If you deposited via Visa, the first chunk of your withdrawal goes back to that same Visa. Any remaining profit beyond your deposited amount can then be sent to a bank account, e-wallet, or crypto address in your name.',
      'Stage three is the available methods. inTrendFX supports Visa, Mastercard, bank wire, SEPA, Skrill, Neteller, and USDT (TRC20/ERC20). You can withdraw in USD, EUR, GBP, or USDT. Cards and e-wallets typically clear within a few hours; bank wires within 1-3 business days; crypto within minutes.',
      'Stage four is the transfer. Most withdrawals are processed by our operations team the same day they are requested. Cut-off times and weekends can introduce a small delay, but to date every single client withdrawal we have committed to has been processed in full. No hidden fees, no surprise rejections.',
      'If a withdrawal is rejected for compliance reasons, you will get an email with the exact reason and what to provide. Our support team will walk you through any extra step required — usually it is a clearer photo of an ID or a more recent utility bill.',
    ],
    readTime: '9 min read',
    date: 'April 8, 2026',
  },
  {
    slug: 'psychology-consistent-traders',
    category: 'Trader Psychology',
    title: 'The Psychology of Consistent Traders',
    excerpt: 'Consistency in trading is 90% mental and 10% technical. The traders who survive and thrive are not the ones who found the perfect indicator. They are the ones who learned to manage themselves before managing the market.',
    body: [
      'In trading, consistency is rarer than profitability. Plenty of traders make money. Very few do it consistently for years. The difference is almost entirely psychological — the ability to follow your own rules even when your emotions are screaming at you to break them.',
      'The first habit of consistent traders is process orientation. They do not measure success by the P&L of a single day. They measure it by whether they followed their plan. A losing day where they followed their rules is a good day. A winning day where they got lucky is a warning sign. This sounds backwards until you have lived it for a year.',
      'The second habit is journaling. Every consistent trader we have worked with keeps a written record. Not a fancy spreadsheet — just notes after each session. What did I plan to trade? What did I actually trade? Why did I deviate? The patterns become obvious after 30 days of honest journaling.',
      'The third habit is detachment from individual trades. Consistent traders do not get attached to outcomes. They take the setup, place the trade, and accept whatever the market delivers. If they win, fine. If they lose, fine. The next trade gets the same treatment. This emotional flatness is not natural — it is built through deliberate practice.',
      'The fourth habit is acceptance of small wins. Consistent traders are happy with 0.5% to 1% per day on average. They do not chase 5% days. They know that compounding 0.5% over 200 trading days produces a return that no single big day can match — and it does so without the large equity swings that big trades always bring.',
      'The hardest part is patience with the process. Most traders who fail in the first three months would have made it if they had stayed disciplined for six. The market does not reward speed. It rewards staying power.',
    ],
    readTime: '12 min read',
    date: 'April 2, 2026',
  },
  {
    slug: 'standard-vs-ecn-accounts',
    category: 'Strategy',
    title: 'Standard vs ECN Account — Which Is Right for You?',
    excerpt: 'Standard, Pro, and ECN accounts each serve different trading styles. The right choice depends on your trade size, your strategy, and how cost-sensitive your edge is. Here is an honest comparison so you can pick the account that actually fits.',
    body: [
      'Most new clients face this question on day one: should I open a Standard, Pro, or ECN account? All three execute the same way on the same liquidity. The only real differences are the cost structure and the minimum deposit. The right choice depends on how big your trades are and how active your strategy is.',
      'A Standard account is built for new and casual traders. Spreads start from 1.2 pips on EUR/USD, there is no commission, and the minimum deposit is just $100. For a trader placing 0.1 lot positions a few times a week, the all-in cost on EUR/USD is roughly $1.20 per round-turn trade. Simple, predictable, and easy to budget for.',
      'A Pro account tightens the spread to around 0.6 pips on EUR/USD, still with no commission, but requires a $1,000 minimum deposit and access to a dedicated account manager. For traders placing one full lot multiple times a week, the saving versus Standard is significant. Pro accounts are also where you start unlocking the Gold loyalty tier with $2 per lot cashback.',
      'An ECN account is for active traders, scalpers, and algo systems. Spreads are raw — from 0.0 pips on EUR/USD — and the broker charges a flat $3.5 per lot per side. On a one-lot EUR/USD round-turn that is $7 in commission plus whatever the raw spread is at that moment. For high-frequency strategies that depend on the very tightest possible pricing, ECN almost always wins on total cost.',
      'There is also a psychological layer. Standard accounts hide the trading cost inside the spread, which makes it easier to forget about. ECN accounts show the cost as an explicit commission on every ticket, which forces you to take it seriously. Many traders find ECN account statements help them improve their setup selection — because every losing scalp now has a visible $7 tag attached to it.',
      'The honest answer is most serious traders graduate through all three. They start on Standard while they are learning, switch to Pro when they are placing real size consistently, and move to ECN once they are confident their strategy can pay the commission and still produce edge. There is no wrong order. Pick the account that matches where you are today, not where you hope to be in a year.',
    ],
    readTime: '13 min read',
    date: 'March 26, 2026',
  },
];

export default function BlogPage() {
  const [activePost, setActivePost] = useState(null);

  if (activePost) {
    return (
      <div className="landing-page min-h-screen bg-white">
        <TopBanner />
        <Navbar />

        <article className="pt-28 pb-14 md:pt-44 md:pb-24 px-6">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => { setActivePost(null); window.scrollTo(0, 0); }}
              className="text-sm font-semibold text-[#0158c6] hover:underline mb-6 inline-flex items-center gap-1"
            >
              ← Back to all articles
            </button>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-xs font-semibold text-[#0158c6] bg-[rgba(1,88,198,0.06)] px-3 py-1 rounded-full uppercase tracking-wider">{activePost.category}</span>
              <span className="text-xs text-[#6B7080] flex items-center gap-1"><Clock size={12} /> {activePost.readTime}</span>
              <span className="text-xs text-[#6B7080]">{activePost.date}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-6">
              {activePost.title}
            </h1>

            <p className="text-lg sm:text-xl text-[#6B7080] leading-relaxed mb-10 italic border-l-4 border-[#0158c6] pl-5">
              {activePost.excerpt}
            </p>

            <div className="space-y-6 text-base sm:text-lg text-[#0D0F1A] leading-relaxed">
              {activePost.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-[#E8EAF0]">
              <p className="text-sm text-[#6B7080] mb-4">Ready to apply this on your own live account?</p>
              <Link to="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all">
                View Accounts <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 md:pt-44 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#0158c6] uppercase tracking-widest mb-4">Resources</p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em' }} className="text-[#0D0F1A] mb-6">
            Honest insights for <span className="text-[#0158c6]">global forex traders</span>
          </h1>
          <p className="text-base sm:text-lg text-[#6B7080] max-w-2xl mx-auto leading-relaxed">
            Long-form articles written by traders, not marketers. We cover the parts of online forex trading that matter — risk, psychology, withdrawals, and what actually works across global sessions.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <article
                key={post.slug}
                onClick={() => { setActivePost(post); window.scrollTo(0, 0); }}
                className={`group cursor-pointer bg-white border border-[#E8EAF0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-[#0158c6] transition-all ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-xs font-semibold text-[#0158c6] bg-[rgba(1,88,198,0.06)] px-3 py-1 rounded-full uppercase tracking-wider">{post.category}</span>
                  <span className="text-xs text-[#6B7080] flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  <span className="text-xs text-[#6B7080]">{post.date}</span>
                </div>

                <h2 className={`font-bold text-[#0D0F1A] mb-3 leading-tight group-hover:text-[#0158c6] transition-colors ${i === 0 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`} style={{ letterSpacing: '-0.02em' }}>
                  {post.title}
                </h2>

                <p className="text-base text-[#6B7080] leading-relaxed mb-5">
                  {post.excerpt}
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0158c6]">
                  <BookOpen size={14} /> Read full article <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-14 md:py-20 px-6 bg-[#FAFBFD]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }} className="text-[#0D0F1A] mb-4">
            Want trading insights in your inbox?
          </h2>
          <p className="text-base text-[#6B7080] mb-8 max-w-xl mx-auto">
            We publish one article a week. No promotional emails, no upsells — just the kind of stuff we wish someone had told us when we started.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 rounded-full bg-white border border-[#E8EAF0] text-[#0D0F1A] text-sm focus:outline-none focus:border-[#0158c6] transition-all"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-full bg-[#0158c6] text-white font-semibold text-sm hover:bg-[#0199c6] transition-all shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
