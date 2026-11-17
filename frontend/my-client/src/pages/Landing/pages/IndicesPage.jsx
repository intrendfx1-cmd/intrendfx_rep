import { BarChart2, Globe2, Zap, Layers } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Trading · Indices',
  titleStart: 'Trade the World\'s',
  titleHighlight: 'Top Indices',
  subtitle:
    'Take a view on entire economies and sectors with CFDs on the most-traded equity indices from the US, Europe, Asia and Australia — with competitive margins and 24/5 access.',
  primaryCta: { label: 'Open Account', to: '/register' },
  secondaryCta: { label: 'Try Demo', to: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=900&q=80',
    alt: 'Global indices market board',
    statusLabel: 'US30 · NAS100 · GER40',
    statusNote: 'Live index quotes',
  },
  featuresTitleStart: 'Why Trade Indices',
  featuresTitleHighlight: 'With Us',
  features: [
    { icon: BarChart2, title: 'Global Coverage', desc: 'US, European, Asian and Australian indices — all under one trading account.' },
    { icon: Globe2, title: '24/5 Access', desc: 'Trade major indices around the clock from Sydney open to New York close.' },
    { icon: Zap, title: 'Low Latency', desc: 'Index quotes delivered sub-30ms with direct routing to tier-1 liquidity providers.' },
    { icon: Layers, title: 'Flexible Leverage', desc: 'Use up to 1:200 leverage on major indices with strict negative balance protection.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80',
    alt: 'Stock index ticker',
    eyebrow: 'Available Indices',
    titleStart: 'US,',
    titleHighlight: 'Europe, Asia & Beyond',
    body:
      'Get directional exposure to entire economies with a single CFD position. From the S&P 500 to the Nikkei, inTrendFX makes index trading transparent and accessible.',
    checklist: [
      'US30 — Dow Jones',
      'NAS100 — Nasdaq 100',
      'SPX500 — S&P 500',
      'GER40 — DAX',
      'UK100 — FTSE 100',
      'JP225 — Nikkei 225',
    ],
  },
  cta: {
    title: 'Trade Indices Like a Pro',
    body: 'Open a live account and start trading the world\'s top equity indices with competitive margins.',
    button: 'Open Account',
    buttonTo: '/register',
  },
};

export default function IndicesPage() {
  return <SimpleLandingPage config={config} />;
}
