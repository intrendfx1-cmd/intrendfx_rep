import { Wallet, Zap, ShieldCheck, Layers } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Accounts · Standard',
  titleStart: 'The',
  titleHighlight: 'Standard Account',
  titleEnd: 'for Everyone',
  subtitle:
    'A zero-commission account with friendly spreads, low minimum deposit, and full access to forex, metals, indices and crypto CFDs. The easiest way to start trading the global markets.',
  primaryCta: { label: 'Open Standard Account', to: '/register' },
  secondaryCta: { label: 'Try Demo', to: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
    alt: 'Standard trading account dashboard',
    statusLabel: 'Min deposit · $100',
    statusNote: 'No commission',
  },
  featuresTitleStart: 'Standard Account ',
  featuresTitleHighlight: 'Highlights',
  features: [
    { icon: Wallet, title: 'Low Minimum Deposit', desc: 'Get started with just $100 — no hidden requirements, no monthly fees.' },
    { icon: Zap, title: 'Spreads from 1.2 pips', desc: 'Competitive variable spreads on majors with zero commission per trade.' },
    { icon: ShieldCheck, title: 'Negative Balance Protection', desc: 'Never lose more than your account balance — protection on every Standard account.' },
    { icon: Layers, title: 'All Instruments Included', desc: '60+ forex pairs, metals, indices and crypto CFDs from a single login.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
    alt: 'Standard account features',
    eyebrow: 'What you get',
    titleStart: 'Everything',
    titleHighlight: 'You Need',
    body:
      'The Standard account is built around simplicity. No commission, no platform fees, no hidden costs — just the markets, your strategy, and full broker support whenever you need it.',
    checklist: [
      'Min deposit: $100',
      'Spreads from 1.2 pips',
      'Zero commission per trade',
      'Leverage up to 1:500',
      'MT4, MT5 & Web Platform',
      'EAs, scalping & hedging allowed',
      '24/5 multilingual support',
      'Same-day withdrawals',
    ],
  },
  cta: {
    title: 'Start with the Standard Account',
    body: 'Sign up in minutes, fund your wallet, and begin trading the global markets today.',
    button: 'Open Standard Account',
    buttonTo: '/register',
  },
};

export default function StandardAccountPage() {
  return <SimpleLandingPage config={config} />;
}
