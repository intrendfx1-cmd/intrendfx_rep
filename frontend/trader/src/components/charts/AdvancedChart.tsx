'use client';

import { useEffect, useRef, memo, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useTradingStore } from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import { intrendfxDatafeed } from '@/lib/charting/datafeed';
import { createBroker } from '@/lib/charting/broker';
import ChartPositionOverlay from './ChartPositionOverlay';

/**
 * Loads the charting_library standalone script once, resolves when window.TradingView
 * is available.
 */
let scriptPromise: Promise<void> | null = null;
function loadChartingLib(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    if ((window as any).TradingView?.widget) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = '/charting_library/charting_library.standalone.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load charting library'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Quick timeframe pills shown above the chart — codes are TradingView
// resolution strings (min as number, 'D' for day) so they match its candles.
const CHART_INTERVALS: { code: string; label: string }[] = [
  { code: '1', label: '1m' },
  { code: '3', label: '3m' },
  { code: '5', label: '5m' },
  { code: '15', label: '15m' },
  { code: '30', label: '30m' },
  { code: '60', label: '1H' },
  { code: '240', label: '4H' },
  { code: '1D', label: '1D' },
];

function AdvancedChartInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const pathname = usePathname();

  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useTradingStore((s) => s.setSelectedSymbol);
  const theme = useUIStore((s) => s.theme);

  const onTradingTerminal = Boolean(pathname?.startsWith('/trading/terminal'));
  const tvTheme = theme === 'light' ? 'light' : 'dark';
  const interval = onTradingTerminal ? '5' : '15';
  // Keep the chart on the last real symbol when the order panel closes
  // (closing sets selectedSymbol=''). Falling back to a hardcoded default
  // made the chart jump to XAUUSD every time the panel was dismissed.
  const lastSymbolRef = useRef('XAUUSD');
  if (selectedSymbol) lastSymbolRef.current = selectedSymbol;
  const symbol = selectedSymbol || lastSymbolRef.current;

  // Track what the widget was created with — only recreate on theme/interval change, NOT symbol
  const createdWithRef = useRef({ theme: '', interval: '' });
  const chartReadyRef = useRef(false);
  const symbolRef = useRef(symbol);
  symbolRef.current = symbol;

  // Holds the widget reference *only* once onChartReady has fired. Driving
  // the overlay off this state (instead of a boolean tick + widgetRef.current
  // read at render time) avoids a Strict-Mode race where the cleanup of the
  // first effect run nulls widgetRef.current before the second run's
  // onChartReady callback bumps the tick — leaving the overlay un-mounted.
  const [readyWidget, setReadyWidget] = useState<any | null>(null);

  // Timeframe pill state — starts at the interval the widget is created with.
  const [activeInterval, setActiveInterval] = useState<string>(interval);
  const changeInterval = useCallback((code: string) => {
    setActiveInterval(code);
    try { widgetRef.current?.activeChart?.().setResolution?.(code); } catch {}
  }, []);

  /** Create or recreate the widget (only on mount or theme change). */
  const createWidget = useCallback(async () => {
    if (!containerRef.current) return;

    // Skip recreation if only symbol changed — handled by setSymbol() below
    if (
      widgetRef.current &&
      createdWithRef.current.theme === tvTheme &&
      createdWithRef.current.interval === interval
    ) {
      return;
    }

    // Remove previous widget
    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
      chartReadyRef.current = false;
      setReadyWidget(null);
    }

    await loadChartingLib();

    const TV = (window as any).TradingView;
    if (!TV?.widget || !containerRef.current) return;

    const w = new TV.widget({
      container: containerRef.current,
      locale: 'en',
      library_path: '/charting_library/',
      datafeed: intrendfxDatafeed,
      symbol: symbolRef.current,
      interval,
      timezone: 'Etc/UTC',
      theme: tvTheme as 'dark' | 'light',
      fullscreen: false,
      autosize: true,
      debug: false,

      // Quick timeframe buttons in the top toolbar (1m / 5m / 15m / 30m / 1H / 4H / 1D).
      favorites: {
        intervals: ['1', '5', '15', '30', '60', '240', '1D'],
      },

      // Trading Terminal — built-in order panel
      broker_factory: (host: any) => createBroker(host),

      disabled_features: [
        'use_localstorage_for_settings',
        'header_compare',
        'header_symbol_search',
        'display_market_status',
        'popup_hints',
      ],
      enabled_features: [
        'study_templates',
        'side_toolbar_in_fullscreen_mode',
        'trading_notifications',
        'show_trading_notifications_history',
        'pinch_scale',
        'horz_touch_drag_scroll',
        'vert_touch_drag_scroll',
      ],
      overrides: {
        'mainSeriesProperties.style': 1, // candles
        // Match current tradingview.com palette (up #089981 / down #f23645).
        'mainSeriesProperties.candleStyle.upColor': '#089981',
        'mainSeriesProperties.candleStyle.downColor': '#f23645',
        'mainSeriesProperties.candleStyle.borderUpColor': '#089981',
        'mainSeriesProperties.candleStyle.borderDownColor': '#f23645',
        'mainSeriesProperties.candleStyle.wickUpColor': '#089981',
        'mainSeriesProperties.candleStyle.wickDownColor': '#f23645',
        'paneProperties.background': tvTheme === 'dark' ? '#0d0d0d' : '#ffffff',
        'paneProperties.backgroundType': 'solid',
        'scalesProperties.textColor': tvTheme === 'dark' ? '#aaaaaa' : '#555555',
        'scalesProperties.backgroundColor': tvTheme === 'dark' ? '#0d0d0d' : '#ffffff',
      },
      studies_overrides: {
        'volume.volume.color.0': '#f23645', // down
        'volume.volume.color.1': '#089981', // up
        'volume.volume.transparency': 50,
      },
      loading_screen: {
        backgroundColor: tvTheme === 'dark' ? '#0e0e0e' : '#f2efe9',
        foregroundColor: tvTheme === 'dark' ? '#2962FF' : '#2962FF',
      },
    });

    widgetRef.current = w;
    createdWithRef.current = { theme: tvTheme, interval };

    // Listen for symbol changes from within the chart
    w.onChartReady(() => {
      chartReadyRef.current = true;
      // eslint-disable-next-line no-console
      console.log('[ChartOverlay] onChartReady fired — exposing widget');
      // Only expose this widget if the ref still points at it (guards
      // against Strict-Mode double-mount race where an old widget's
      // callback fires after a newer one has replaced it).
      if (widgetRef.current === w) setReadyWidget(w);
      // Keep our pills in sync when the interval changes from inside the chart.
      try {
        w.activeChart().onIntervalChanged().subscribe(null, (iv: string) => setActiveInterval(iv));
        setActiveInterval(w.activeChart().resolution());
      } catch {}
      w.activeChart().onSymbolChanged().subscribe(null, () => {
        const newSym = w.activeChart().symbol();
        if (newSym) {
          const cleaned = newSym.includes(':') ? newSym.split(':').pop()! : newSym;
          if (cleaned.toUpperCase() !== (selectedSymbol || '').toUpperCase()) {
            setSelectedSymbol(cleaned.toUpperCase());
          }
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tvTheme, interval, setSelectedSymbol]);

  // Mount / recreate only on theme or interval change
  useEffect(() => {
    createWidget();
    return () => {
      if (widgetRef.current) {
        try { widgetRef.current.remove(); } catch {}
        widgetRef.current = null;
        chartReadyRef.current = false;
        setReadyWidget(null);
      }
    };
  }, [createWidget]);

  // Fast symbol switch — just call setSymbol(), no widget recreation
  const prevSymbolRef = useRef(symbol);
  useEffect(() => {
    if (symbol !== prevSymbolRef.current) {
      prevSymbolRef.current = symbol;
      const w = widgetRef.current;
      if (w && chartReadyRef.current) {
        try {
          const current = w.activeChart().symbol();
          const currentClean = current?.includes(':') ? current.split(':').pop() : current;
          if ((currentClean || '').toUpperCase() !== symbol.toUpperCase()) {
            w.activeChart().setSymbol(symbol);
          }
        } catch {}
      } else if (w) {
        // Widget exists but not ready yet — wait for it
        w.onChartReady(() => {
          chartReadyRef.current = true;
          try { w.activeChart().setSymbol(symbol); } catch {}
        });
      }
    }
  }, [symbol]);

  const surface = 'bg-bg-base';

  return (
    <div className={clsx('relative w-full h-full min-h-[200px] min-w-0 flex flex-col', surface)}>
      {/* Quick timeframe selector (TradingView-style pills). */}
      <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto border-b border-border-primary shrink-0">
        {CHART_INTERVALS.map((tf) => (
          <button
            key={tf.code}
            type="button"
            onClick={() => changeInterval(tf.code)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors',
              activeInterval === tf.code
                ? 'bg-[#2962FF] text-white'
                : 'text-text-secondary hover:bg-bg-hover',
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="relative flex-1 min-h-[160px] min-w-0">
        <div
          ref={containerRef}
          className={clsx('w-full h-full min-h-[160px] min-w-0', surface)}
          style={{ touchAction: 'none' }}
          onWheel={(e) => e.stopPropagation()}
          data-tv-chart-root
        />
        {/* Interactive layer for SL/TP/close buttons drawn over the chart. */}
        <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }} />
        {readyWidget && (
          <ChartPositionOverlay widget={readyWidget} containerRef={containerRef} overlayRef={overlayRef} />
        )}
      </div>
    </div>
  );
}

export default memo(AdvancedChartInner);
