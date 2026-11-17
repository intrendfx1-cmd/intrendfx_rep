/**
 * ========================================
 * INTRENDFX LANDING PAGE CONFIGURATION
 * ========================================
 *
 * Edit this file to customize your landing page.
 * No React knowledge needed — just change the values below.
 *
 * After saving, the page will hot-reload automatically.
 */

const landingConfig = {

  // ─── BRAND ─────────────────────────────────────
  brand: {
    name: 'inTrendFX',
    tagline: 'Trade Forex with Confidence.',
    logo: '/landing/img/intrendfx-logo.png',
  },

  // ─── HERO SECTION ──────────────────────────────
  hero: {
    title: 'Trade Forex with',
    highlight: 'Confidence. Globally.',
    subtitle: 'Trade 60+ forex pairs, metals, indices, and crypto with tight spreads from 0.0 pips, leverage up to 1:500, ultra-fast execution, and tier-1 liquidity — on MT4, MT5, and the inTrendFX Web Platform.',
    primaryCTA: {
      text: 'Open Account',
      link: '/pricing',
    },
    secondaryCTA: {
      text: 'Free Demo',
      link: '/login',
    },
    floatingBadges: ['Tier-1 Liquidity', '24/5 Forex Sessions', 'Up to 1:500 Leverage', 'Same-day Withdrawals'],
  },

  // ─── FEATURES SECTION ─────────────────────────
  features: [
    {
      icon: '📡',
      title: 'Tier-1 Liquidity',
      description: 'Institutional liquidity feeds with sub-30ms execution across all 60+ instruments.',
    },
    {
      icon: '🛡️',
      title: 'Regulated & Protected',
      description: 'FCA and CySEC oversight, segregated client funds, and negative balance protection on all live accounts.',
    },
    {
      icon: '⚡',
      title: 'Instant Order Execution',
      description: 'STP/ECN routing with no dealer intervention, no requotes, and full real-time position monitoring.',
    },
    {
      icon: '🌐',
      title: 'Global 24/5 Access',
      description: 'Trade Sydney, Tokyo, London, and New York sessions from a single unified dashboard.',
    },
    {
      icon: '📊',
      title: 'Pro Trading Platforms',
      description: 'MT4, MT5, the inTrendFX Web Platform, and iOS/Android mobile apps — fully synced.',
    },
  ],

  // ─── STATS SECTION ────────────────────────────
  stats: [
    { value: '40,000+', label: 'Active Clients' },
    { value: '$50M+', label: 'Monthly Volume' },
    { value: '60+', label: 'Instruments' },
    { value: '99.9%', label: 'Uptime' },
  ],

  // ─── HOW IT WORKS ─────────────────────────────
  steps: [
    {
      step: '01',
      title: 'Open Your Account',
      description: 'Pick an account type that matches your trading style — Standard, Pro, ECN, or VIP. Sign-up takes under 60 seconds.',
    },
    {
      step: '02',
      title: 'Verify & Fund',
      description: 'Complete KYC with a government ID and proof of address. Fund from $100 via card, bank wire, e-wallet, or crypto.',
    },
    {
      step: '03',
      title: 'Trade Global Markets',
      description: 'Trade 60+ instruments on MT4, MT5, or the inTrendFX Web Platform with tight spreads and fast execution.',
    },
    {
      step: '04',
      title: 'Withdraw Anytime',
      description: 'Request a withdrawal in USD, EUR, GBP, or USDT — most are processed the same business day with no hidden fees.',
    },
  ],

  // ─── TESTIMONIALS ─────────────────────────────
  testimonials: [
    {
      name: 'Marcus Chen',
      role: 'Day Trader, Singapore',
      avatar: 'MC',
      text: 'inTrendFX gave me the execution and pricing I needed. Tight spreads, sub-30ms fills, and withdrawals in USD hit my account within hours.',
      rating: 5,
    },
    {
      name: 'Sofia Almeida',
      role: 'Algo Trader, Portugal',
      avatar: 'SA',
      text: 'Finally a broker where EAs and high-frequency setups are allowed without restrictions. ECN spreads stay tight even during news.',
      rating: 5,
    },
    {
      name: 'Hiroshi Tanaka',
      role: 'Forex Trader, Japan',
      avatar: 'HT',
      text: 'The Diamond loyalty tier rebate pays $5 per lot — that adds up fast. Transparent pricing, transparent rewards. Exactly what I wanted.',
      rating: 5,
    },
  ],

  // ─── CTA BANNER ───────────────────────────────
  ctaBanner: {
    title: 'Ready to Start Trading Forex?',
    subtitle: 'Join thousands of clients who trust inTrendFX for tight spreads, fast execution, and same-day withdrawals.',
    buttonText: 'Open Live Account',
    buttonLink: '/register',
  },

  // ─── FOOTER ───────────────────────────────────
  footer: {
    description: 'Your global online forex broker — tight spreads, fast execution, and tier-1 liquidity across 60+ markets.',
    links: {
      Platform: [
        { text: 'Home', href: '#home' },
        { text: 'How It Works', href: '#howItWorks' },
        { text: 'Open Account', href: '/register' },
      ],
      Resources: [
        { text: 'Withdrawal Proofs', href: '#' },
        { text: 'FAQs', href: '#' },
        { text: 'Contact Us', href: '#contact' },
      ],
      Legal: [
        { text: 'Privacy Policy', href: '/privacy-policy' },
        { text: 'Terms & Conditions', href: '/terms' },
        { text: 'Refund Policy', href: '/refund-policy' },
      ],
    },
    copyright: `© ${new Date().getFullYear()} inTrendFX. All rights reserved.`,
    disclaimer: 'inTrendFX is a regulated online forex and CFD brokerage. Trading leveraged products carries a high level of risk and may not be suitable for every investor. Past performance does not guarantee future results. Please ensure you fully understand the risks before trading.',
  },

  // ─── SECTION VISIBILITY ───────────────────────
  sections: {
    hero: true,
    features: true,
    stats: true,
    howItWorks: true,
    testimonials: true,
    ctaBanner: true,
    footer: true,
  },
};

export default landingConfig;
