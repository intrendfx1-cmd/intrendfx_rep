import { ShieldCheck, Zap, Globe2, Wallet } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Company · Why inTrendFX',
  titleStart: 'Why Traders',
  titleHighlight: 'Choose inTrendFX',
  subtitle:
    'A regulated, transparent, and globally accessible online forex broker built on tier-1 liquidity, ultra-fast execution, and the support traders actually need to grow.',
  primaryCta: { label: 'Open Account', to: '/register' },
  secondaryCta: { label: 'Contact Us', to: '/contact-us' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    alt: 'inTrendFX brokerage overview',
    statusLabel: 'Regulated · FCA · CySEC',
    statusNote: 'Segregated client funds',
  },
  featuresTitleStart: 'Built on',
  featuresTitleHighlight: 'Trust & Speed',
  features: [
    { icon: ShieldCheck, title: 'Fully Regulated', desc: 'Authorised by the FCA and CySEC with segregated client funds and investor protection.' },
    { icon: Zap, title: 'Tier-1 Liquidity', desc: 'Aggregated institutional feeds with sub-30ms execution on every instrument.' },
    { icon: Globe2, title: 'Available in 90+ Countries', desc: 'A truly global brokerage with multilingual 24/5 customer support.' },
    { icon: Wallet, title: 'Same-day Withdrawals', desc: 'Most withdrawals are processed within 24 hours, back to the same payment method.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
    alt: 'Why choose inTrendFX',
    eyebrow: 'What sets us apart',
    titleStart: 'Transparent.',
    titleHighlight: 'Reliable. Global.',
    body:
      'We built inTrendFX around the things that matter most to active traders — institutional-grade execution, transparent pricing, real customer support, and the regulation that lets you sleep at night.',
    checklist: [
      'Regulated by FCA & CySEC',
      'Segregated client funds',
      'Negative balance protection',
      'Spreads from 0.0 pips',
      'Sub-30ms execution',
      'MT4, MT5 & Web Platform',
      'Same-day withdrawals',
      '24/5 multilingual support',
    ],
  },
  cta: {
    title: 'Trade with a Broker You Can Trust',
    body: 'Join thousands of traders who chose inTrendFX for transparency, speed, and global reach.',
    button: 'Open Account',
    buttonTo: '/register',
  },
};

export default function WhyIntrendfxPage() {
  return <SimpleLandingPage config={config} />;
}
