import { Crown, Zap, Headphones, BarChart3 } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Accounts · Pro',
  titleStart: 'The',
  titleHighlight: 'Pro Account',
  titleEnd: 'for Serious Traders',
  subtitle:
    'Tighter spreads, lower commissions and a dedicated account manager. The Pro account is built for traders who size up and need institutional-grade conditions on every fill.',
  primaryCta: { label: 'Open Pro Account', to: '/register' },
  secondaryCta: { label: 'Try Demo', to: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80',
    alt: 'Professional trader workstation',
    statusLabel: 'Min deposit · $5,000',
    statusNote: 'Raw spreads',
  },
  featuresTitleStart: 'Pro Account',
  featuresTitleHighlight: 'Advantages',
  features: [
    { icon: Crown, title: 'Raw Spreads from 0.0 pips', desc: 'Institutional-grade spreads passed straight from tier-1 liquidity providers.' },
    { icon: Zap, title: '$3.5 / lot / side', desc: 'Transparent commission structure — no markup, no markdown, no hidden fees.' },
    { icon: Headphones, title: 'Dedicated Account Manager', desc: 'A personal relationship manager to help with strategy, sizing and operations.' },
    { icon: BarChart3, title: 'VPS Hosting Included', desc: 'Free MT4/MT5 VPS hosting for 24/5 EA execution close to our servers.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    alt: 'Pro account analytics',
    eyebrow: 'Built for serious traders',
    titleStart: 'Tighter Spreads,',
    titleHighlight: 'Faster Fills',
    body:
      'When you size up, every pip and every millisecond matters. The Pro account upgrades your execution, your spreads, and the support you can rely on when markets move.',
    checklist: [
      'Min deposit: $5,000',
      'Spreads from 0.0 pips',
      '$3.5 / lot / side commission',
      'Leverage up to 1:500',
      'Priority order routing',
      'Dedicated account manager',
      'Free MT4/MT5 VPS',
      'Same-day priority withdrawals',
    ],
  },
  cta: {
    title: 'Upgrade to Pro',
    body: 'Open a Pro account today and trade with institutional-grade conditions.',
    button: 'Open Pro Account',
    buttonTo: '/register',
  },
};

export default function ProAccountPage() {
  return <SimpleLandingPage config={config} />;
}
