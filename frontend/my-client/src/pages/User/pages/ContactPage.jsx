import { useOutletContext } from 'react-router-dom';

function ContactPage() {
  const { user } = useOutletContext();

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ padding: '24px 28px 60px' }}>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Home / <span style={{ color: 'var(--text-primary)' }}>Contact</span>
        </div>

        <h1 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: '700', margin: '0 0 4px' }}>Contact Support</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 28px' }}>Need help? Reach out to us through any of the channels below.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { icon: '\u{1F4DE}', title: 'Phone Support', desc: '+91 8367045119', sub: 'Mon-Sat, 10:00 AM - 6:00 PM IST', href: 'tel:+918367045119' },
            { icon: '\u{1F4E7}', title: 'Email Support', desc: 'support@intrendfx.com', sub: 'We typically respond within 24 hours', href: 'mailto:support@intrendfx.com' },
            { icon: '\u{1F4AC}', title: 'WhatsApp', desc: '+91 8367045119', sub: 'Chat with us anytime', href: 'https://wa.me/918367045119' },
            { icon: '\u{1F4F1}', title: 'Telegram', desc: '@intrendfx', sub: 'Join our community for updates', href: 'https://t.me/intrendfx' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '20px', borderRadius: '14px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '16px'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px', flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '2px' }}>{item.title}</div>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600', textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    {item.desc}
                  </a>
                ) : (
                  <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>{item.desc}</div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '700', margin: '28px 0 14px' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { q: 'How do I open a live account?', a: 'Sign up, verify your identity (KYC), and make your first deposit. You can be trading on a live MT4, MT5, or web platform account within minutes.' },
            { q: 'Can I run more than one account?', a: 'Yes — you can open and run multiple accounts (Standard, Pro, ECN, Demo) under one login.' },
            { q: 'How do withdrawals work?', a: 'Withdraw any time from your wallet. Funds are returned to the same payment method used for deposit and processed within 24 hours.' },
          ].map((faq, i) => (
            <div key={i} style={{
              padding: '16px 18px', borderRadius: '12px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px', marginBottom: '4px' }}>{faq.q}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
