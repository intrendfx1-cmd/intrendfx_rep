import { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import brandLogo from '../../../assets/intrndfx_logo_white.png';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Trading', to: '/trading' },
  {
    label: 'Platforms',
    dropdown: [
      { label: 'Web Platform',  to: '/platforms/web' },
      { label: 'Copy Trading',  to: '/platforms/copy-trading' },
      { label: 'IB Management', to: '/platforms/ib-management' },
    ],
  },
  { label: 'Accounts', to: '/accounts' },
  { label: 'Education', to: '/education' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact-us' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const { pathname } = useLocation();
  const hideTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns when navigating
  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
    setMobileDropdown(null);
  }, [pathname]);

  const openDropdown = (label) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setActiveDropdown(label);
  };

  // Small delay so cursor can travel from trigger to menu without flicker
  const scheduleClose = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const isDropdownActive = (dropdown) =>
    dropdown?.some((d) => pathname === d.to || pathname.startsWith(d.to + '/'));

  // Navbar stays in a consistent dark theme (light text) at all scroll positions.
  const onHero = true;
  const linkCls = (active) =>
    `text-sm font-medium transition-colors ${
      active ? 'text-white' : 'text-white/80 hover:text-white'
    }`;

  return (
    <header
      className={`fixed left-0 w-full z-50 transition-all duration-300 top-0 backdrop-blur-xl ${
        scrolled
          ? 'bg-[#0C0C1D]/70 border-b border-white/10'
          : 'bg-white/5 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={brandLogo}
            alt="intrendFX"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-7 whitespace-nowrap">
          {navLinks.map((link) =>
            link.dropdown ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => openDropdown(link.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 ${linkCls(
                    isDropdownActive(link.dropdown) || activeDropdown === link.label
                  )}`}
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === link.label}
                  onClick={() =>
                    setActiveDropdown(activeDropdown === link.label ? null : link.label)
                  }
                >
                  {link.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeDropdown === link.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-150 ${
                    activeDropdown === link.label
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-1'
                  }`}
                  onMouseEnter={() => openDropdown(link.label)}
                  onMouseLeave={scheduleClose}
                >
                  <div className="min-w-[220px] bg-white border border-[#E8EAF0] rounded-xl shadow-[0_12px_36px_rgba(13,15,26,0.1)] p-1.5">
                    {link.dropdown.map((sub) => {
                      const isActive = pathname === sub.to;
                      return (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'text-[#0158c6] bg-[rgba(1,88,198,0.08)]'
                              : 'text-[#0D0F1A] hover:text-[#0158c6] hover:bg-[#F4F7FB]'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={linkCls(pathname === link.to)}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            to="/login"
            className={`hidden lg:block ${linkCls(false)}`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white text-sm font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(77,190,81,0.4)] shadow-[0_4px_14px_rgba(1,88,198,0.28)] transition-all whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
          >
            Open Account
            <ArrowRight size={14} />
          </Link>

          <button
            className={`lg:hidden p-1 ${onHero ? 'text-white' : 'text-[#0D0F1A]'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#E8EAF0] shadow-lg">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div key={link.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setMobileDropdown(mobileDropdown === link.label ? null : link.label)
                    }
                    className="w-full flex items-center justify-between py-3 border-b border-[#E8EAF0] text-base font-medium text-[#0D0F1A]"
                    aria-expanded={mobileDropdown === link.label}
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        mobileDropdown === link.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {mobileDropdown === link.label && (
                    <div className="pl-4 py-2 flex flex-col">
                      {link.dropdown.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={() => setMobileOpen(false)}
                          className="py-2.5 text-sm font-medium text-[#0D0F1A] hover:text-[#0158c6] transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-[#0D0F1A] hover:text-[#0158c6] transition-colors py-3 border-b border-[#E8EAF0]"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="flex gap-3 pt-4">
              <Link to="/login" className="flex-1 text-center py-3 rounded-full border border-[#E8EAF0] text-sm font-semibold text-[#0D0F1A]">
                Login
              </Link>
              <Link
                to="/register"
                className="flex-1 text-center py-3 rounded-full text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #0158c6 0%, #0199c6 35%, #4dbe51 75%, #81ce65 100%)' }}
              >
                Open Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
