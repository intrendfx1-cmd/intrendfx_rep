'use client';

import { useEffect } from 'react';

/** After a deploy, a tab opened on the previous build asks for JS chunks that no longer exist. */
const isChunkError = (e: Error) =>
  /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module/i.test(`${e?.name} ${e?.message}`);

export default function GlobalError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  const chunk = isChunkError(error);

  useEffect(() => {
    if (!chunk) return;
    // Reload once to pick up the new build; the timestamp guard prevents a reload loop.
    try {
      const last = Number(sessionStorage.getItem('chunk-reload-at') || 0);
      if (Date.now() - last < 30_000) return;
      sessionStorage.setItem('chunk-reload-at', String(Date.now()));
    } catch {
      /* storage blocked — reload anyway */
    }
    window.location.reload();
  }, [chunk]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f1115',
          color: '#e5e7eb',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: 24, maxWidth: 360 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>
            {chunk ? 'Updating to the latest version…' : 'Something went wrong'}
          </h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 20px', lineHeight: 1.5 }}>
            {chunk
              ? 'inTrendFX was just updated. The page will reload automatically.'
              : 'Please reload the page. If this keeps happening, contact support.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: '#2196f3',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              padding: '10px 22px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
