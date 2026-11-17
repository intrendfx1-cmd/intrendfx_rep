import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import brandLogo from '../../../assets/intrndfx_logo_white.png';

const footerColumns = [
  {
    title: 'Trading',
    links: [
      { label: 'Forex',       to: '/trading/forex' },
      { label: 'Commodities', to: '/trading/commodities' },
      { label: 'Indices',     to: '/trading/indices' },
      { label: 'Crypto',      to: '/trading/crypto' },
    ],
  },
  {
    title: 'Platforms',
    links: [
      { label: 'Web Platform',  to: '/platforms/web' },
      { label: 'Copy Trading',  to: '/platforms/copy-trading' },
      { label: 'IB Management', to: '/platforms/ib-management' },
    ],
  },
  {
    title: 'Accounts',
    links: [
      { label: 'Standard', to: '/accounts/standard' },
      { label: 'Pro',      to: '/accounts/pro' },
      { label: 'Demo',     to: '/accounts/demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',       to: '/about' },
      { label: 'Why inTrendFX',  to: '/why-intrendfx' },
      { label: 'Contact',        to: '/contact-us' },
    ],
  },
  {
    title: 'Education',
    links: [
      { label: 'Tutorials',   to: '/education/tutorials' },
      { label: 'Blog',        to: '/blog' },
      { label: 'Market News', to: '/education/news' },
    ],
  },
];

export default function Footer() {
  const { ref: linksRef } = useScrollAnimation(0.05);

  return (
    <footer className="bg-[#0C0C1D] border-t border-[rgba(255,255,255,0.08)] relative overflow-hidden">
      {/* Top gradient strip — brand colors */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Brand strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-12 border-b border-[rgba(255,255,255,0.08)] mb-12">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={brandLogo}
              alt="intrendFX"
              className="h-9 w-auto"
            />
          </Link>
          <p className="text-sm text-[#9AA0B4] leading-relaxed max-w-xl">
            Your global online forex broker — tight spreads, fast execution, and tier-1 liquidity
            across 60+ markets on MT4, MT5, and the inTrendFX Web Platform.
          </p>
        </div>

        {/* 5-column link grid */}
        <div
          ref={linksRef}
          className="scroll-reveal grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10"
        >
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#9AA0B4] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(255,255,255,0.08)] pt-8 mt-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#9AA0B4]">© 2026 inTrendFX. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/terms" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Terms & Conditions</Link>
              <Link to="/privacy-policy" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/refund-policy" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Refund Policy</Link>
              <Link to="/risk-disclaimer" className="text-sm text-[#9AA0B4] hover:text-white transition-colors">Risk Disclaimer</Link>
            </div>
          </div>
          <p className="text-xs text-[#9AA0B4] mt-4 leading-relaxed text-center md:text-left">
            inTrendFX is a global online forex and CFD brokerage regulated by the FCA and CySEC.
            Trading leveraged products such as forex and CFDs carries a high level of risk and may
            not be suitable for every investor. Past performance does not guarantee future results.
            Please ensure you fully understand the risks before trading.
          </p>
        </div>
      </div>
    </footer>
  );
}
