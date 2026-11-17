import { Bitcoin, Globe2, Zap, ShieldCheck } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Trading · Crypto CFDs',
  titleStart: 'Trade Crypto',
  titleHighlight: 'CFDs',
  titleEnd: '24/7',
  subtitle:
    'Speculate on the world\'s top cryptocurrencies via CFDs — no wallet, no exchange account, no token custody. Trade BTC, ETH, SOL and more with the same fast execution you get on forex.',
  primaryCta: { label: 'Open Account', to: '/register' },
  secondaryCta: { label: 'Try Demo', to: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=900&q=80',
    alt: 'Crypto market trading',
    statusLabel: 'BTC · ETH · SOL · XRP',
    statusNote: 'Trades 24/7',
  },
  featuresTitleStart: 'Crypto Trading,',
  featuresTitleHighlight: 'Reinvented',
  features: [
    { icon: Bitcoin, title: 'Major Crypto CFDs', desc: 'BTC, ETH, SOL, XRP and other large-cap tokens via leveraged CFDs.' },
    { icon: Globe2, title: '24/7 Markets', desc: 'Crypto never sleeps — neither does inTrendFX. Trade weekends and holidays.' },
    { icon: Zap, title: 'No Wallet Needed', desc: 'Trade price action without custody risk, on-chain fees or exchange withdrawals.' },
    { icon: ShieldCheck, title: 'Risk Controls', desc: 'Built-in stop-loss, take-profit and negative balance protection on every crypto position.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=900&q=80',
    alt: 'Crypto chart analysis',
    eyebrow: 'Available Crypto CFDs',
    titleStart: 'The',
    titleHighlight: 'Top Tokens',
    body:
      'inTrendFX gives you simple CFD exposure to the most-traded cryptocurrencies. Trade them like any other instrument — long or short, with leverage, from your existing trading account.',
    checklist: [
      'BTC/USD — Bitcoin',
      'ETH/USD — Ethereum',
      'SOL/USD — Solana',
      'XRP/USD — Ripple',
      'ADA, DOT, LINK majors',
      'Up to 1:20 leverage',
    ],
  },
  cta: {
    title: 'Add Crypto to Your Portfolio',
    body: 'Open a live account and trade crypto CFDs alongside forex, metals and indices — all from one platform.',
    button: 'Open Account',
    buttonTo: '/register',
  },
};

export default function CryptoPage() {
  return <SimpleLandingPage config={config} />;
}
