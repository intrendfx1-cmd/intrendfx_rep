import { Gauge, Layers, BarChart2, Zap } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Accounts · Demo',
  titleStart: 'Practice Trading with a Free',
  titleHighlight: 'Demo Account',
  subtitle:
    'Test the inTrendFX platform with $100,000 of virtual capital. Trade real-time forex, metals, indices and crypto prices in a risk-free environment — no deposit, no commitment.',
  primaryCta: { label: 'Open Free Demo', to: '/register' },
  secondaryCta: { label: 'Sign In', to: '/login' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    alt: 'Demo trading platform',
    statusLabel: '$100,000 virtual balance',
    statusNote: 'No deposit required',
  },
  featuresTitleStart: 'Why Use a',
  featuresTitleHighlight: 'Demo Account',
  features: [
    { icon: Gauge, title: 'Real Market Conditions', desc: 'Live price feeds, real spreads and the exact same platform you\'ll use for live trading.' },
    { icon: Layers, title: 'All Instruments', desc: 'Practice on 60+ forex pairs, metals, indices and crypto CFDs with virtual funds.' },
    { icon: BarChart2, title: 'Test Strategies', desc: 'Run EAs, backtests and scalping strategies without risking real capital.' },
    { icon: Zap, title: 'Instant Setup', desc: 'Create a demo account in under a minute — no KYC, no deposit, no commitment.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
    alt: 'Demo account dashboard',
    eyebrow: 'Demo features',
    titleStart: 'Risk-Free',
    titleHighlight: 'Practice Trading',
    body:
      'Your demo is identical to a live Standard account in every way except the funds. Build confidence, test strategies and learn the platform inside-out before going live.',
    checklist: [
      '$100,000 virtual capital',
      'Real-time market data',
      'All instruments available',
      'MT4, MT5 & Web Platform',
      'Live spreads & execution',
      'EAs and scalping allowed',
      'Reset balance anytime',
      'Upgrade to live in one click',
    ],
  },
  cta: {
    title: 'Start Practicing Today',
    body: 'Open a demo account in minutes and master the platform before going live.',
    button: 'Open Free Demo',
    buttonTo: '/register',
  },
};

export default function DemoAccountPage() {
  return <SimpleLandingPage config={config} />;
}
