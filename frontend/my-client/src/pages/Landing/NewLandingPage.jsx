import { lazy, Suspense } from 'react';
import './landing.css';

// Above-the-fold: load eagerly for instant first paint
import TopBanner from './components/TopBanner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

// Below-the-fold: lazy load to keep initial bundle small and page responsive
const AnimatedStatement = lazy(() => import('./components/AnimatedStatement'));
const TangibleOutcomes  = lazy(() => import('./components/TangibleOutcomes'));
const EffectiveTrading  = lazy(() => import('./components/EffectiveTrading'));
const HomePricing       = lazy(() => import('./components/HomePricing'));
const MarketAccess      = lazy(() => import('./components/MarketAccess'));
const WhyChooseUs       = lazy(() => import('./components/WhyChooseUs'));
const TradingPlatform   = lazy(() => import('./components/TradingPlatform'));
const FAQ               = lazy(() => import('./components/FAQ'));
const AccountOpening    = lazy(() => import('./components/AccountOpening'));
const Contact           = lazy(() => import('./components/Contact'));
const Footer            = lazy(() => import('./components/Footer'));

const TradingConditions = lazy(() => import('./components/TradingConditions'));
const GlobalSessions    = lazy(() => import('./components/GlobalSessions'));
const ProfitSplit       = lazy(() => import('./components/ProfitSplit'));
const RiskRules         = lazy(() => import('./components/RiskRules'));
const TraderAcademy     = lazy(() => import('./components/TraderAcademy'));
const TraderCommunity   = lazy(() => import('./components/TraderCommunity'));
const ComplianceTrust   = lazy(() => import('./components/ComplianceTrust'));

const SectionFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center" />
);

export default function NewLandingPage() {
  return (
    <div className="landing-page min-h-screen bg-white">
      <TopBanner />
      <Navbar />
      <Hero />

      <Suspense fallback={<SectionFallback />}>
        {/* ── Reference-style headline sections (top-prominent) ──────────── */}
        <AnimatedStatement />
        <TangibleOutcomes />
        <EffectiveTrading />

        {/* ── Existing trading-specific sections ─────────────────────────── */}
        <MarketAccess />
        <TradingConditions />
        <WhyChooseUs />
        <GlobalSessions />
        <HomePricing />
        <ProfitSplit />
        <TradingPlatform />
        <RiskRules />
        <TraderAcademy />
        <TraderCommunity />
        <FAQ />
        <AccountOpening />
        <Contact />
        <ComplianceTrust />
        <Footer />
      </Suspense>
    </div>
  );
}
