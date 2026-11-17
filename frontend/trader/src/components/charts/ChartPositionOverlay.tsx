'use client';

import { useEffect, useRef, type RefObject } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { useTradingStore, type Position, type InstrumentInfo } from '@/stores/tradingStore';

/**
 * MT5/cTrader-style position tools on the chart:
 *  - Entry line (blue buy / orange sell) with a pill: SIDE lots + live P&L + ✕ (close).
 *  - SL line (amber) and TP line (teal), each with a DRAGGABLE pill pinned to its own
 *    price showing the level + projected P&L, and an × to remove that bracket.
 *  - Dragging a pill applies the new SL/TP DIRECTLY (no confirm popup) — like Exness.
 *
 * Lines use core `createShape('horizontal_line')` (Trading-Terminal's
 * `createPositionLine` renders nothing when a `broker_factory` is wired). Pills are
 * HTML positioned by a manual price→pixel calc (this Advanced-Charts build has no
 * `priceToCoordinate`).
 */

const COLORS = {
  buy: '#2962FF',
  sell: '#FF6D00',
  sl: '#f59e0b',
  tp: '#14b8a6',
} as const;

const LINE_STYLE = { solid: 0, dashed: 2 } as const;
const PILL_RIGHT_PX = 64; // clear the right price axis

function calcPnl(pos: Position, price: number, instruments: InstrumentInfo[]): number {
  const inst = instruments.find(
    (i) => String(i.symbol).toUpperCase() === String(pos.symbol).toUpperCase(),
  );
  const cs = inst?.contract_size || 100000;
  return pos.side === 'buy'
    ? (price - pos.open_price) * pos.lots * cs
    : (pos.open_price - price) * pos.lots * cs;
}

const fmtPnl = (n: number) => `${n >= 0 ? '+' : '-'}$${Math.abs(n).toFixed(2)}`;

interface Props {
  widget: unknown;
  containerRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
}

export default function ChartPositionOverlay({ widget, containerRef, overlayRef }: Props) {
  const positions = useTradingStore((s) => s.positions);
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const shapesRef = useRef<Map<string, ShapeSet>>(new Map());
  const creatingRef = useRef<Set<string>>(new Set());

  const symbolUpper = (selectedSymbol || '').toUpperCase();
  const positionsKey = positions
    .filter((p) => (p.symbol || '').toUpperCase() === symbolUpper)
    .map((p) => `${p.id}:${p.side}:${p.lots}`)
    .join(',');

  // ── Chart lines (entry / SL / TP) via createShape ────────────────────────
  useEffect(() => {
    const w = widget as any;
    return () => {
      let chart: any = null;
      try { chart = w?.activeChart?.(); } catch {}
      for (const set of shapesRef.current.values()) {
        if (chart) {
          try { chart.removeEntity(set.entryId); } catch {}
          if (set.slId) try { chart.removeEntity(set.slId); } catch {}
          if (set.tpId) try { chart.removeEntity(set.tpId); } catch {}
        }
      }
      shapesRef.current.clear();
      creatingRef.current.clear();
    };
  }, [widget]);

  useEffect(() => {
    if (!widget) return;
    const w = widget as any;
    let chart: any;
    try { chart = w.activeChart(); } catch { return; }
    if (!chart || typeof chart.createShape !== 'function') return;

    const symbolPositions = positions.filter(
      (p) => (p.symbol || '').toUpperCase() === symbolUpper,
    );
    const currentIds = new Set(symbolPositions.map((p) => p.id));
    const existing = shapesRef.current;

    for (const [id, set] of Array.from(existing.entries())) {
      if (!currentIds.has(id)) {
        try { chart.removeEntity(set.entryId); } catch {}
        if (set.slId) try { chart.removeEntity(set.slId); } catch {}
        if (set.tpId) try { chart.removeEntity(set.tpId); } catch {}
        existing.delete(id);
      }
    }

    for (const pos of symbolPositions) {
      const set = existing.get(pos.id);
      if (!set) {
        if (creatingRef.current.has(pos.id)) continue;
        creatingRef.current.add(pos.id);
        void createShapeSet(chart, pos)
          .then((newSet) => {
            if (!newSet) return;
            // The shape is created async. If the position was CLOSED while we
            // were creating it, the reconcile loop already ran (and found
            // nothing to remove, since it wasn't in `existing` yet). Remove the
            // just-created shape now so a closed trade never leaves an orphan
            // line lingering on the chart until a manual refresh.
            const stillOpen = useTradingStore.getState().positions.some((x) => x.id === pos.id);
            if (!stillOpen) {
              try { chart.removeEntity(newSet.entryId); } catch {}
              if (newSet.slId) try { chart.removeEntity(newSet.slId); } catch {}
              if (newSet.tpId) try { chart.removeEntity(newSet.tpId); } catch {}
              return;
            }
            existing.set(pos.id, newSet);
          })
          .catch(() => {})
          .finally(() => creatingRef.current.delete(pos.id));
      } else {
        void updateShapeSet(chart, set, pos);
      }
    }
  }, [widget, positions, symbolUpper]);

  // ── Interactive pills (drag SL/TP direct, ✕ close, × remove) ─────────────
  useEffect(() => {
    const w = widget as any;
    const overlay = overlayRef.current;
    if (!w?.activeChart || !overlay) return;
    let chart: any;
    try { chart = w.activeChart(); } catch { return; }
    if (!chart?.crossHairMoved) return;

    const sym = symbolUpper;
    const store = () => useTradingStore.getState();

    type Geo = { top: number; bottom: number; h: number; log: boolean };
    const geom = (): Geo | null => {
      try {
        const pane = chart.getPanes?.()[0];
        const ps = pane?.getMainSourcePriceScale?.();
        if (!ps) return null;
        const mode = ps.getMode?.() ?? 0;
        if (mode !== 0 && mode !== 1) return null;
        const range = ps.getVisiblePriceRange?.();
        const h = pane?.getHeight?.() || 0;
        if (!range || !(h > 0) || !(range.to > range.from)) return null;
        if (mode === 1 && !(range.from > 0)) return null;
        return { top: range.to, bottom: range.from, h, log: mode === 1 };
      } catch { return null; }
    };
    const paneY = (price: number, g: Geo): number => {
      if (g.log) {
        if (!(price > 0)) return NaN;
        const lt = Math.log(g.top), lb = Math.log(g.bottom);
        return (g.h * (lt - Math.log(price))) / (lt - lb);
      }
      return (g.h * (g.top - price)) / (g.top - g.bottom);
    };
    let calibOffset: number | null = null;
    const onCross = (p: any) => {
      if (!p || typeof p.price !== 'number' || typeof p.offsetY !== 'number') return;
      const g = geom();
      if (!g) return;
      const py = paneY(p.price, g);
      if (Number.isFinite(py)) calibOffset = p.offsetY - py;
    };
    let crossSub: any = null;
    try { crossSub = chart.crossHairMoved(); crossSub?.subscribe?.(null, onCross); } catch {}

    const priceForY = (containerY: number): number | null => {
      const g = geom();
      if (!g || calibOffset == null) return null;
      const py = containerY - calibOffset;
      if (g.log) {
        const lt = Math.log(g.top), lb = Math.log(g.bottom);
        return Math.exp(lt - (py / g.h) * (lt - lb));
      }
      return g.top - (py / g.h) * (g.top - g.bottom);
    };

    const digits = store().instruments.find(
      (i) => String(i.symbol).toUpperCase() === sym,
    )?.digits ?? 2;

    // Direct apply — NO confirm popup. Backend does a partial update, so the
    // other bracket is untouched.
    const applyBracket = async (p: Position, kind: 'sl' | 'tp', price: number | null) => {
      const label = kind === 'sl' ? 'SL' : 'TP';
      const field = kind === 'sl' ? 'stop_loss' : 'take_profit';
      // Optimistic — the line/pill appears, moves or disappears instantly; the
      // PUT + refresh reconciles. No waiting on the round-trip, no lingering line.
      const before = store().positions;
      store().setPositions(before.map((x) => (x.id === p.id ? { ...x, [field]: price ?? undefined } : x)));
      try {
        await api.put(`/positions/${p.id}`,
          kind === 'sl' ? { stop_loss: price } : { take_profit: price });
        toast.success(price === null ? `${label} removed` : `${label} @ ${price.toFixed(digits)}`);
        await store().refreshPositions();
      } catch (err) {
        store().setPositions(before); // rollback the optimistic change
        toast.error(err instanceof Error ? err.message : `Failed to set ${label}`);
        void store().refreshPositions();
      }
    };

    const closePosition = async (p: Position) => {
      try { store().removePosition(p.id); } catch {}
      try {
        const res = await api.post<{ profit?: number; close_price?: number }>(
          `/positions/${p.id}/close`, {}, { timeoutMs: 8000 });
        toast.success(`Closed @ ${res?.close_price ?? ''} | ${fmtPnl(Number(res?.profit ?? 0))}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Close failed');
      } finally {
        Promise.all([store().refreshPositions(), store().refreshAccount()]).catch(() => {});
      }
    };

    // A pill = coloured rounded box with a label + a small × button, pinned to a
    // price on the right of the chart. sl/tp pills are draggable (ns-resize) and
    // apply directly on release.
    const mkPill = (
      kind: 'entry' | 'sl' | 'tp',
      p: Position,
      bg: string,
    ): { root: HTMLDivElement; label: HTMLSpanElement } => {
      const root = document.createElement('div');
      root.style.cssText =
        `position:absolute;right:${PILL_RIGHT_PX}px;transform:translateY(-50%);`
        + `display:flex;align-items:center;gap:4px;height:20px;padding:0 3px 0 7px;`
        + `border-radius:4px;background:${bg};color:#fff;font:700 10px system-ui;`
        + `white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.55);`
        + `pointer-events:auto;visibility:hidden;z-index:6;`
        + (kind === 'entry' ? '' : `cursor:ns-resize;touch-action:none;-webkit-user-select:none;user-select:none;`);
      const label = document.createElement('span');
      label.style.cssText = 'line-height:1;';
      const x = document.createElement('button');
      x.type = 'button';
      x.textContent = '✕';
      x.title = kind === 'entry' ? 'Close position at market' : `Remove ${kind.toUpperCase()}`;
      x.style.cssText =
        `display:flex;align-items:center;justify-content:center;width:15px;height:15px;`
        + `border:0;border-radius:3px;background:rgba(255,255,255,.22);color:#fff;`
        + `font-size:9px;line-height:1;cursor:pointer;padding:0;`;
      x.onpointerdown = (e) => { e.stopPropagation(); };
      x.onclick = (e) => {
        e.stopPropagation();
        if (kind === 'entry') void closePosition(p);
        else void applyBracket(p, kind, null);
      };
      root.appendChild(label);
      root.appendChild(x);

      if (kind !== 'entry') {
        root.onpointerdown = (e) => {
          e.preventDefault(); e.stopPropagation();
          try { root.setPointerCapture(e.pointerId); } catch {}
          const startY = e.clientY;
          let moved = false;
          const color = kind === 'sl' ? COLORS.sl : COLORS.tp;
          const line = document.createElement('div');
          line.style.cssText = `position:absolute;left:0;right:0;top:0;height:0;border-top:1px dashed ${color};pointer-events:none;z-index:7;`;
          overlay.appendChild(line);
          const cleanup = () => { try { overlay.removeChild(line); } catch {} };
          root.onpointermove = (ev) => {
            if (Math.abs(ev.clientY - startY) > 2) moved = true;
            const r = containerRef.current?.getBoundingClientRect();
            if (!r) return;
            const cy = ev.clientY - r.top;
            const price = priceForY(cy);
            line.style.top = `${cy}px`;
            root.style.top = `${cy}px`;
            if (price) label.textContent = `${kind.toUpperCase()} ${price.toFixed(digits)}  ${fmtPnl(calcPnl(p, price, store().instruments))}`;
          };
          const finish = (ev: PointerEvent, cancel: boolean) => {
            root.onpointermove = null; root.onpointerup = null; root.onpointercancel = null;
            try { root.releasePointerCapture(ev.pointerId); } catch {}
            cleanup();
            if (cancel || !moved) return;
            const r = containerRef.current?.getBoundingClientRect();
            const price = r ? priceForY(ev.clientY - r.top) : null;
            if (price && price > 0) void applyBracket(p, kind, price); // DIRECT — no popup
          };
          root.onpointerup = (ev) => finish(ev, false);
          root.onpointercancel = (ev) => finish(ev, true);
        };
      }
      return { root, label };
    };

    const myPos = store().positions.filter((p) => (p.symbol || '').toUpperCase() === sym);
    type Pills = { p: Position; entry: number; entryEl: HTMLDivElement; entryLabel: HTMLSpanElement; slEl: HTMLDivElement; slLabel: HTMLSpanElement; tpEl: HTMLDivElement; tpLabel: HTMLSpanElement };
    const pills: Pills[] = [];
    for (const p of myPos) {
      const side = String(p.side).toUpperCase();
      const sideColor = side === 'BUY' ? COLORS.buy : COLORS.sell;
      const e = mkPill('entry', p, sideColor);
      const s = mkPill('sl', p, 'rgba(245,158,11,0.97)');
      const t = mkPill('tp', p, 'rgba(20,184,166,0.97)');
      overlay.appendChild(e.root); overlay.appendChild(s.root); overlay.appendChild(t.root);
      pills.push({ p, entry: Number(p.open_price) || 0, entryEl: e.root, entryLabel: e.label, slEl: s.root, slLabel: s.label, tpEl: t.root, tpLabel: t.label });
    }
    if (pills.length === 0) {
      try { crossSub?.unsubscribe?.(null, onCross); } catch {}
      return () => {};
    }

    let raf = 0;
    const sync = () => {
      raf = requestAnimationFrame(sync);
      const g = geom();
      const h = containerRef.current?.clientHeight || (g?.h ?? 0);
      if (!g || calibOffset == null) {
        for (const b of pills) { b.entryEl.style.visibility = 'hidden'; b.slEl.style.visibility = 'hidden'; b.tpEl.style.visibility = 'hidden'; }
        return;
      }
      const off = calibOffset;
      const live = store().positions;
      const instruments = store().instruments;
      const place = (el: HTMLDivElement, price: number) => {
        const y = paneY(price, g) + off;
        if (!(y > 8) || y > h - 8) { el.style.visibility = 'hidden'; return null; }
        el.style.top = `${y}px`; el.style.visibility = 'visible';
        return y;
      };
      for (const b of pills) {
        const lp = live.find((x) => x.id === b.p.id) || b.p;
        const entryY = place(b.entryEl, b.entry);
        b.entryLabel.textContent = `${String(lp.side).toUpperCase()} ${Number(lp.lots).toFixed(2)}  ${fmtPnl(lp.profit || 0)}`;

        // Unset pills stack on the correct side of the entry: BUY → SL below /
        // TP above; SELL → SL above / TP below (SL is always the loss side, TP
        // the profit side). Set pills sit at their real price.
        const isBuy = String(lp.side).toLowerCase() === 'buy';
        const slOffset = isBuy ? 24 : -24;
        const tpOffset = isBuy ? -24 : 24;

        const slSet = lp.stop_loss && lp.stop_loss > 0 ? Number(lp.stop_loss) : null;
        if (slSet != null) {
          place(b.slEl, slSet);
          b.slLabel.textContent = `SL ${slSet.toFixed(digits)}  ${fmtPnl(calcPnl(lp, slSet, instruments))}`;
        } else if (entryY != null) {
          b.slEl.style.top = `${entryY + slOffset}px`; b.slEl.style.visibility = 'visible';
          b.slLabel.textContent = 'SL';
        } else { b.slEl.style.visibility = 'hidden'; }

        const tpSet = lp.take_profit && lp.take_profit > 0 ? Number(lp.take_profit) : null;
        if (tpSet != null) {
          place(b.tpEl, tpSet);
          b.tpLabel.textContent = `TP ${tpSet.toFixed(digits)}  ${fmtPnl(calcPnl(lp, tpSet, instruments))}`;
        } else if (entryY != null) {
          b.tpEl.style.top = `${entryY + tpOffset}px`; b.tpEl.style.visibility = 'visible';
          b.tpLabel.textContent = 'TP';
        } else { b.tpEl.style.visibility = 'hidden'; }
      }
    };
    raf = requestAnimationFrame(sync);

    return () => {
      cancelAnimationFrame(raf);
      try { crossSub?.unsubscribe?.(null, onCross); } catch {}
      for (const b of pills) { for (const el of [b.entryEl, b.slEl, b.tpEl]) { try { overlay.removeChild(el); } catch {} } }
    };
  }, [widget, symbolUpper, positionsKey, containerRef, overlayRef]);

  return null;
}

// ───────────────────────────── line helpers ────────────────────────────────

interface ShapeSet {
  entryId: string;
  slId: string | null;
  tpId: string | null;
  lastEntryPrice: number;
  lastSL: number | undefined;
  lastTP: number | undefined;
  lastLots: number;
  lastSide: 'buy' | 'sell';
  lastPnl: number;
}

function nowSec() { return Math.floor(Date.now() / 1000); }

const SHAPE_BASE = {
  lock: true,
  disableSelection: true,
  disableSave: true,
  disableUndo: true,
  zOrder: 'top' as const,
};

function bracketOverride(color: string) {
  return {
    linecolor: color,
    linestyle: LINE_STYLE.dashed,
    linewidth: 1,
    showLabel: false,
    horzLabelsAlign: 'right',
    vertLabelsAlign: 'top',
    fontsize: 11,
    bold: true,
  };
}

async function createShapeSet(chart: any, pos: Position): Promise<ShapeSet | null> {
  const t = nowSec();
  const entryColor = pos.side === 'buy' ? COLORS.buy : COLORS.sell;

  let entryId: string;
  try {
    entryId = await chart.createShape(
      { time: t, price: pos.open_price },
      {
        shape: 'horizontal_line',
        ...SHAPE_BASE,
        overrides: {
          linecolor: entryColor,
          linestyle: LINE_STYLE.solid,
          linewidth: 2,
          showLabel: false,
        },
      },
    );
  } catch { return null; }

  let slId: string | null = null;
  if (pos.stop_loss && pos.stop_loss > 0) {
    try {
      slId = await chart.createShape(
        { time: t, price: pos.stop_loss },
        { shape: 'horizontal_line', ...SHAPE_BASE, overrides: bracketOverride(COLORS.sl) },
      );
    } catch {}
  }

  let tpId: string | null = null;
  if (pos.take_profit && pos.take_profit > 0) {
    try {
      tpId = await chart.createShape(
        { time: t, price: pos.take_profit },
        { shape: 'horizontal_line', ...SHAPE_BASE, overrides: bracketOverride(COLORS.tp) },
      );
    } catch {}
  }

  return {
    entryId, slId, tpId,
    lastEntryPrice: pos.open_price,
    lastSL: pos.stop_loss,
    lastTP: pos.take_profit,
    lastLots: pos.lots,
    lastSide: pos.side,
    lastPnl: pos.profit || 0,
  };
}

async function updateShapeSet(chart: any, set: ShapeSet, pos: Position) {
  const t = nowSec();

  if (pos.open_price !== set.lastEntryPrice) {
    try { chart.getShapeById(set.entryId)?.setPoints([{ time: t, price: pos.open_price }]); } catch {}
    set.lastEntryPrice = pos.open_price;
  }

  const slNow = pos.stop_loss && pos.stop_loss > 0 ? pos.stop_loss : undefined;
  if (slNow != null && set.slId) {
    if (slNow !== set.lastSL) {
      try { chart.getShapeById(set.slId)?.setPoints([{ time: t, price: slNow }]); } catch {}
      set.lastSL = slNow;
    }
  } else if (slNow != null && !set.slId) {
    try {
      set.slId = await chart.createShape({ time: t, price: slNow },
        { shape: 'horizontal_line', ...SHAPE_BASE, overrides: bracketOverride(COLORS.sl) });
      set.lastSL = slNow;
    } catch {}
  } else if (slNow == null && set.slId) {
    try { chart.removeEntity(set.slId); } catch {}
    set.slId = null; set.lastSL = undefined;
  }

  const tpNow = pos.take_profit && pos.take_profit > 0 ? pos.take_profit : undefined;
  if (tpNow != null && set.tpId) {
    if (tpNow !== set.lastTP) {
      try { chart.getShapeById(set.tpId)?.setPoints([{ time: t, price: tpNow }]); } catch {}
      set.lastTP = tpNow;
    }
  } else if (tpNow != null && !set.tpId) {
    try {
      set.tpId = await chart.createShape({ time: t, price: tpNow },
        { shape: 'horizontal_line', ...SHAPE_BASE, overrides: bracketOverride(COLORS.tp) });
      set.lastTP = tpNow;
    } catch {}
  } else if (tpNow == null && set.tpId) {
    try { chart.removeEntity(set.tpId); } catch {}
    set.tpId = null; set.lastTP = undefined;
  }
}
