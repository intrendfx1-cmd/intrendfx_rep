import { Newspaper, CalendarClock, Globe2, BarChart2 } from 'lucide-react';
import SimpleLandingPage from '../components/SimpleLandingPage';

const config = {
  eyebrow: 'Education · Market News',
  titleStart: 'Stay Ahead with',
  titleHighlight: 'Market News',
  subtitle:
    'Real-time news, daily market briefings, and an integrated economic calendar — everything you need to stay informed and trade the moves that matter.',
  primaryCta: { label: 'Open Account', to: '/register' },
  secondaryCta: { label: 'Read the Blog', to: '/blog' },
  heroImage: {
    src: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
    alt: 'Market news dashboard',
    statusLabel: 'Live news feed',
    statusNote: 'Updated 24/7',
  },
  featuresTitleStart: 'Your Market',
  featuresTitleHighlight: 'Edge',
  features: [
    { icon: Newspaper, title: 'Real-Time News', desc: 'Aggregated headlines and breaking news from top financial newswires, directly in-platform.' },
    { icon: CalendarClock, title: 'Economic Calendar', desc: 'Every major release tracked, ranked by impact, with previous and forecast values.' },
    { icon: Globe2, title: 'Global Coverage', desc: 'News and analysis on forex, indices, commodities and crypto across every major session.' },
    { icon: BarChart2, title: 'Daily Briefings', desc: 'Morning briefing every weekday covering the London open and key intraday catalysts.' },
  ],
  splitSection: {
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80',
    alt: 'Financial news desk',
    eyebrow: 'Inside the news hub',
    titleStart: 'Everything,',
    titleHighlight: 'In One Place',
    body:
      'No more juggling tabs and apps. The inTrendFX news hub brings together real-time headlines, the economic calendar, and our in-house analysis — all in a single, clean interface.',
    checklist: [
      'Real-time financial news',
      'Economic calendar — high/medium/low',
      'Central bank meeting trackers',
      'Daily morning briefing',
      'Forex, indices, commodities, crypto',
      'Earnings and IPO calendar',
      'In-platform alerts',
      'Free for all clients',
    ],
  },
  cta: {
    title: 'Trade the News with Confidence',
    body: 'Open an account and access live news, the economic calendar, and our daily morning briefing.',
    button: 'Open Account',
    buttonTo: '/register',
  },
};

export default function MarketNewsPage() {
  return <SimpleLandingPage config={config} />;
}
