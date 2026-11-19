/**
 * Take-profit / stop-loss entry modes for the order panel.
 * Pure math, no imports — self-check: `node src/lib/sltp.ts`.
 *
 * A level can be typed as an asset price, a pip distance, an amount of money,
 * or a % of equity. Everything converts to an absolute PRICE at submit time,
 * relative to the entry (exec price for market, open price for pending).
 */

export type SlTpKind = 'tp' | 'sl';
export type SlTpMode = 'price' | 'pips' | 'money' | 'equity_pct';

export const SLTP_MODE_LABELS: Record<SlTpMode, string> = {
  price: 'By asset price',
  pips: 'In pips',
  money: 'In money',
  equity_pct: 'In % of equity',
};

export interface SlTpCtx {
  side: 'buy' | 'sell';
  /** Entry the level is measured from (ask/bid for market, open price for pending). */
  entry: number;
  pipSize: number;
  digits: number;
  /** Account-currency P&L for a 1.0 move in price at the current lot size. */
  moneyPerPrice: number;
  equity: number;
}

/** +1 when the level sits ABOVE entry (buy TP, sell SL), −1 when below. */
export function levelDirection(kind: SlTpKind, side: 'buy' | 'sell'): 1 | -1 {
  return (side === 'buy') === (kind === 'tp') ? 1 : -1;
}

const round = (n: number, d: number) => Number(n.toFixed(d));

/** Value typed in `mode` → absolute price. null when not computable / not positive. */
export function slTpToPrice(kind: SlTpKind, mode: SlTpMode, value: number, ctx: SlTpCtx): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (mode === 'price') return round(value, ctx.digits);
  if (!(ctx.entry > 0)) return null;
  let dist: number;
  if (mode === 'pips') {
    if (!(ctx.pipSize > 0)) return null;
    dist = value * ctx.pipSize;
  } else {
    if (!(ctx.moneyPerPrice > 0)) return null;
    const money = mode === 'money' ? value : (ctx.equity * value) / 100;
    if (mode === 'equity_pct' && !(ctx.equity > 0)) return null;
    dist = money / ctx.moneyPerPrice;
  }
  const p = ctx.entry + levelDirection(kind, ctx.side) * dist;
  return p > 0 ? round(p, ctx.digits) : null;
}

/** Absolute price → value in `mode` (distance from entry; used when switching modes). */
export function priceToSlTp(mode: SlTpMode, price: number, ctx: SlTpCtx): number | null {
  if (!(price > 0)) return null;
  if (mode === 'price') return round(price, ctx.digits);
  if (!(ctx.entry > 0)) return null;
  const dist = Math.abs(price - ctx.entry);
  if (mode === 'pips') return ctx.pipSize > 0 ? round(dist / ctx.pipSize, 1) : null;
  if (!(ctx.moneyPerPrice > 0)) return null;
  const money = dist * ctx.moneyPerPrice;
  if (mode === 'money') return round(money, 2);
  return ctx.equity > 0 ? round((money / ctx.equity) * 100, 2) : null;
}

/** Signed outcome if the level is hit: pips and account-currency P&L (TP > 0, SL < 0 when valid). */
export function slTpOutcome(price: number, ctx: SlTpCtx): { pips: number; money: number } | null {
  if (!(price > 0) || !(ctx.entry > 0)) return null;
  const move = ctx.side === 'buy' ? price - ctx.entry : ctx.entry - price;
  return {
    pips: ctx.pipSize > 0 ? move / ctx.pipSize : 0,
    money: move * ctx.moneyPerPrice,
  };
}

/** Error text when the level is on the wrong side of entry, else null. */
export function slTpSideError(kind: SlTpKind, price: number, ctx: SlTpCtx, entryLabel: string): string | null {
  if (!(price > 0) || !(ctx.entry > 0)) return null;
  const above = price > ctx.entry;
  const needAbove = levelDirection(kind, ctx.side) === 1;
  if (price === ctx.entry || above !== needAbove) {
    const what = kind === 'tp' ? 'Take profit' : 'Stop loss';
    return `${what} must be ${needAbove ? 'above' : 'below'} the ${entryLabel}`;
  }
  return null;
}

/** Stepper increment for the −/+ buttons in each mode. */
export function slTpStep(mode: SlTpMode, pipSize: number): number {
  if (mode === 'price') return pipSize > 0 ? pipSize : 0.01;
  if (mode === 'pips') return 1;
  if (mode === 'money') return 1;
  return 0.1;
}

/** Split a price for display: "3,769.2" + big "1" … → main / big (pip digits) / sup (pipette). */
export function splitPrice(price: number, digits: number): { main: string; big: string; sup: string } {
  if (!(price > 0)) return { main: '—', big: '', sup: '' };
  const s = price.toFixed(digits);
  const [int, frac = ''] = s.split('.');
  const intFmt = Number(int).toLocaleString('en-US');
  const full = frac ? `${intFmt}.${frac}` : intFmt;
  if (digits >= 3) return { main: full.slice(0, -3), big: full.slice(-3, -1), sup: full.slice(-1) };
  if (digits === 1) return { main: full.slice(0, -3), big: full.slice(-3), sup: '' }; // 50,80|3.9
  return { main: full.slice(0, -2), big: full.slice(-2), sup: '' };
}

export function sltpSelfCheck(): void {
  const eq = (a: number | null, b: number, msg: string) => {
    if (a === null || Math.abs(a - b) > 1e-9) throw new Error(`${msg}: got ${a}, want ${b}`);
  };
  // XAUUSD buy @ 3769.45, pip 0.01, 0.01 lot × 100 oz → $1 per 1.0 move
  const gold: SlTpCtx = { side: 'buy', entry: 3769.45, pipSize: 0.01, digits: 2, moneyPerPrice: 1, equity: 10000 };
  eq(slTpToPrice('tp', 'price', 3780, gold), 3780, 'price passthrough');
  eq(slTpToPrice('tp', 'pips', 100, gold), 3770.45, 'buy TP 100 pips above');
  eq(slTpToPrice('sl', 'pips', 100, gold), 3768.45, 'buy SL 100 pips below');
  eq(slTpToPrice('tp', 'money', 10, gold), 3779.45, 'buy TP $10 = +10.00 price');
  eq(slTpToPrice('sl', 'equity_pct', 1, gold), 3669.45, 'buy SL 1% of $10k = $100 below');
  const goldSell = { ...gold, side: 'sell' as const, entry: 3769.21 };
  eq(slTpToPrice('tp', 'pips', 50, goldSell), 3768.71, 'sell TP below');
  eq(slTpToPrice('sl', 'money', 5, goldSell), 3774.21, 'sell SL above');
  // round-trips
  eq(priceToSlTp('pips', 3770.45, gold), 100, 'price→pips');
  eq(priceToSlTp('money', 3779.45, gold), 10, 'price→money');
  eq(priceToSlTp('equity_pct', 3669.45, gold), 1, 'price→% equity');
  const out = slTpOutcome(3779.45, gold)!;
  eq(out.money, 10, 'outcome money');
  eq(out.pips, 1000, 'outcome pips');
  // wrong-side detection
  if (!slTpSideError('tp', 3760, gold, 'current price')) throw new Error('buy TP below entry must error');
  if (slTpSideError('tp', 3780, gold, 'current price')) throw new Error('buy TP above entry is valid');
  if (slTpSideError('sl', 3770, goldSell, 'current price')) throw new Error('sell SL above entry is valid');
  // invalid input
  if (slTpToPrice('tp', 'pips', 0, gold) !== null) throw new Error('0 must be null');
  if (slTpToPrice('tp', 'money', 10, { ...gold, moneyPerPrice: 0 }) !== null) throw new Error('no rate → null');
  if (slTpToPrice('sl', 'money', 1e9, gold) !== null) throw new Error('SL below zero → null');
  // display split
  const a = splitPrice(3769.21, 2);
  if (`${a.main}|${a.big}|${a.sup}` !== '3,769.|21|') throw new Error(`split gold ${JSON.stringify(a)}`);
  const b = splitPrice(1.09817, 5);
  if (`${b.main}|${b.big}|${b.sup}` !== '1.09|81|7') throw new Error(`split eurusd ${JSON.stringify(b)}`);
  const c = splitPrice(50803.9, 1);
  if (`${c.main}|${c.big}|${c.sup}` !== '50,80|3.9|') throw new Error(`split US30 ${JSON.stringify(c)}`);
  console.log('sltp self-check OK');
}

// `node src/lib/sltp.ts` runs the self-check (Node ≥ 22.6 strips the types).
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('sltp.ts')) sltpSelfCheck();
