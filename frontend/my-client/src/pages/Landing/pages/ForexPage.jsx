import { TrendingUp, Zap, Layers, ShieldCheck } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Trading · Forex',
  titleStart: 'Trade 60+',
  titleHighlight: 'Currency Pairs',
  titleEnd: 'Globally',
  subtitle:
    'Access the world\'s most liquid market with institutional spreads from 0.0 pips, leverage up to 1:500, and ultra-fast execution under 30ms on every major, minor and exotic pair.',
  primaryCta: { label: 'Open Account', to: '/register' },
  secondaryCta: { label: 'Try Demo', to: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1642790551116-18e150f248e3?auto=format&fit=crop&w=900&q=80',
    alt: 'Forex trading chart',
    statusLabel: 'EUR/USD · GBP/USD · USD/JPY',
    statusNote: 'Live spreads',
  },
  featuresTitleStart: 'Why Trade Forex with ',
  featuresTitleHighlight: 'inTrendFX',
  features: [
    { icon: TrendingUp, title: 'Spreads from 0.0 pips', desc: 'Raw spreads on majors with deep tier-1 institutional liquidity.' },
    { icon: Zap, title: 'Sub-30ms Execution', desc: 'Ultra-fast STP/ECN routing with no requotes and no dealer intervention.' },
    { icon: Layers, title: 'Leverage up to 1:500', desc: 'Flexible leverage across majors, minors and exotic currency pairs.' },
    { icon: ShieldCheck, title: 'Regulated Brokerage', desc: 'FCA and CySEC oversight with segregated client funds and negative balance protection.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
    alt: 'Forex pair analysis',
    eyebrow: 'Currency Pairs',
    titleStart: 'Majors, Minors &',
    titleHighlight: 'Exotics',
    body:
      'From the most-traded majors to high-volatility exotics, every pair on inTrendFX is supported with deep liquidity, tight spreads, and 24/5 access across all four global trading sessions.',
    checklist: [
      'EUR/USD, GBP/USD, USD/JPY',
      'AUD/USD, USD/CHF, USD/CAD',
      'NZD/USD, EUR/GBP, EUR/JPY',
      'USD/TRY, USD/ZAR, USD/MXN',
      '24/5 Sydney to New York access',
      'EAs, scalping and hedging allowed',
    ],
  },
  cta: {
    title: 'Trade Forex with Confidence',
    body: 'Open a live account in minutes or test the platform with a free, fully-featured demo account.',
    button: 'Open Account',
    buttonTo: '/register',
  },
};

export default function ForexPage() {
  return <SimpleLandingPage config={config} />;
}
