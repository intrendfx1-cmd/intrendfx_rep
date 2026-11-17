import { Coins, Globe2, Zap, ShieldCheck } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Trading · Commodities',
  titleStart: 'Trade Gold, Silver &',
  titleHighlight: 'Energy CFDs',
  subtitle:
    'Hedge currency exposure or take directional views on the world\'s most active commodity markets — gold, silver, oil and natural gas — with institutional spreads and round-the-clock liquidity.',
  primaryCta: { label: 'Open Account', to: '/register' },
  secondaryCta: { label: 'Try Demo', to: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&q=80',
    alt: 'Gold bars and commodities',
    statusLabel: 'XAU/USD · XAG/USD · WTI',
    statusNote: 'Live commodity prices',
  },
  featuresTitleStart: 'Commodity Trading',
  featuresTitleHighlight: 'Made Simple',
  features: [
    { icon: Coins, title: 'Precious Metals', desc: 'Gold and silver against USD, EUR, and other majors with deep liquidity.' },
    { icon: Globe2, title: 'Energy Markets', desc: 'WTI crude, Brent oil and natural gas — directional trades on global energy flows.' },
    { icon: Zap, title: 'Tight CFD Spreads', desc: 'Competitive spreads on XAU/USD, XAG/USD and energy CFDs with fast execution.' },
    { icon: ShieldCheck, title: 'Risk-Managed', desc: 'Stop-loss, take-profit and negative balance protection on every commodity position.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
    alt: 'Commodity market analysis',
    eyebrow: 'What You Can Trade',
    titleStart: 'Metals,',
    titleHighlight: 'Oil & Gas',
    body:
      'inTrendFX gives you direct CFD access to the most liquid commodity markets, with the same low-latency execution and tight spreads you get on forex majors.',
    checklist: [
      'XAU/USD — Gold',
      'XAG/USD — Silver',
      'WTI Crude Oil',
      'Brent Crude Oil',
      'Natural Gas',
      'Copper, Palladium, Platinum',
    ],
  },
  cta: {
    title: 'Diversify Your Portfolio',
    body: 'Add commodities to your trading mix and balance forex positions with metals and energy CFDs.',
    button: 'Open Account',
    buttonTo: '/register',
  },
};

export default function CommoditiesPage() {
  return <SimpleLandingPage config={config} />;
}
