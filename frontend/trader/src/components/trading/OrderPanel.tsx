'use client';

import { useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Minus, Plus, ChevronDown, ChevronLeft, Zap, X } from 'lucide-react';
import {
  useTradingStore,
  quoteToUsdFactor,
  accountCurrencyFactor,
  type TradingAccount,
} from '@/stores/tradingStore';
import { useUIStore } from '@/stores/uiStore';
import api from '@/lib/api/client';
import { sounds, unlockAudio } from '@/lib/sounds';
import { getDigits } from '@/lib/utils';
import { getMarketStatus } from '@/lib/marketHours';
import { wsManager } from '@/lib/ws/wsManager';
import OrderPanelSymbolPicker from '@/components/trading/OrderPanelSymbolPicker';
import AccountSwitcher from '@/components/trading/AccountSwitcher';
import { formatMoney } from '@/lib/currency';
import {
  SLTP_MODE_LABELS,
  priceToSlTp,
  slTpOutcome,
  slTpSideError,
  slTpStep,
  slTpToPrice,
  splitPrice,
  type SlTpCtx,
  type SlTpKind,
  type SlTpMode,
} from '@/lib/sltp';

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'pending';
type SlTpState = { mode: SlTpMode; value: string };

const EMPTY_LEVEL: SlTpState = { mode: 'price', value: '' };
const BUY = '#2196f3';
const SELL = '#ef5350';

export default function OrderPanel() {
  const {
    terminalMarketsOpen,
    toggleTerminalMarkets,
    oneClickTrading,
    setOneClickTrading,
  } = useUIStore();

  // Sliced selectors — destructuring the whole store re-renders this panel on
  // every tick because `prices` mutates ~30×/sec. Subscribing only to the
  // fields we actually read drops re-renders to the ones we care about.
  const selectedSymbol = useTradingStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useTradingStore((s) => s.setSelectedSymbol);
  const tick = useTradingStore((s) => s.prices[s.selectedSymbol]);
  const instruments = useTradingStore((s) => s.instruments);
  const activeAccount = useTradingStore((s) => s.activeAccount);
  const usdInrRate = useTradingStore((s) => s.usdInrRate);
  const positions = useTradingStore((s) => s.positions);
  const setPositions = useTradingStore((s) => s.setPositions);
  const refreshPositions = useTradingStore((s) => s.refreshPositions);
  const refreshPendingOrders = useTradingStore((s) => s.refreshPendingOrders);
  const refreshAccount = useTradingStore((s) => s.refreshAccount);
  const orderFormCloneDraft = useTradingStore((s) => s.orderFormCloneDraft);
  const setOrderFormCloneDraft = useTradingStore((s) => s.setOrderFormCloneDraft);
  const setTerminalMarketsOpen = useUIStore((s) => s.setTerminalMarketsOpen);
  const setTerminalNewsOpen = useUIStore((s) => s.setTerminalNewsOpen);

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderTab, setOrderTab] = useState<OrderType>('market');
  const [lots, setLots] = useState('0.01');
  const [tp, setTp] = useState<SlTpState>(EMPTY_LEVEL);
  const [sl, setSl] = useState<SlTpState>(EMPTY_LEVEL);
  const [openPrice, setOpenPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [symbolPickerOpen, setSymbolPickerOpen] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const instrumentInfo = instruments.find((i) => i.symbol === selectedSymbol);
  const segment = (instrumentInfo as any)?.segment as string | undefined;
  const digits = getDigits(selectedSymbol);
  const contractSize = instrumentInfo?.contract_size || 100000;
  const ccy = (activeAccount?.currency || 'USD').toUpperCase();

  const marketStatus = useMemo(
    () => getMarketStatus(selectedSymbol, segment),
    [selectedSymbol, segment, Math.floor(Date.now() / 60_000)],
  );

  const execPrice = tick ? (side === 'buy' ? tick.ask : tick.bid) : 0;
  const lotsNum = parseFloat(lots) || 0;
  const openPriceNum = parseFloat(openPrice) || 0;
  const pipSize = instrumentInfo?.pip_size || (digits >= 5 ? 0.00001 : digits === 2 ? 0.01 : 0.0001);

  /** Derive limit vs stop from price vs current ask/bid (matches backend validation). */
  const derivedPendingType: 'limit' | 'stop' | null = useMemo(() => {
    if (orderTab !== 'pending' || !tick || !openPriceNum) return null;
    if (side === 'buy') {
      if (openPriceNum < tick.ask) return 'limit';
      if (openPriceNum > tick.ask) return 'stop';
      return null;
    }
    if (openPriceNum > tick.bid) return 'limit';
    if (openPriceNum < tick.bid) return 'stop';
    return null;
  }, [orderTab, side, openPriceNum, tick]);

  const pendingPipsDiff = useMemo(() => {
    if (orderTab !== 'pending' || !tick || !openPriceNum) return null;
    const ref = side === 'buy' ? tick.ask : tick.bid;
    return (openPriceNum - ref) / pipSize;
  }, [orderTab, tick, openPriceNum, side, pipSize]);

  /** Pending orders measure SL/TP and margin from the open price, not the current quote. */
  const referencePrice = orderTab === 'pending' && openPriceNum > 0 ? openPriceNum : execPrice;

  /** Submit-disabled signal for pending: empty/invalid price, or price equals
   *  current ask/bid (can't infer limit vs stop). */
  const pendingInvalid =
    orderTab === 'pending' && (!openPriceNum || !tick || !derivedPendingType);
  const marginRequired = useMemo(() => {
    if (!referencePrice || !activeAccount) return 0;
    const usd = (lotsNum * contractSize * referencePrice) / activeAccount.leverage;
    // Account margin/balance are stored in the account currency (INR for INR
    // accounts). The raw formula above is in USD, so convert it.
    return usdInrRate > 1 ? usd * usdInrRate : usd;
  }, [referencePrice, lotsNum, activeAccount, contractSize, usdInrRate]);

  const freeMargin = Math.max(0, activeAccount?.free_margin || 0);
  const hasEnoughMargin = freeMargin >= marginRequired;

  /** Account-currency P&L for a 1.0 price move at this volume — same conversion
   *  as live position P&L in the store (quote → USD → account currency). */
  const moneyPerPrice = useMemo(() => {
    if (!referencePrice || !lotsNum) return 0;
    const sym = selectedSymbol.toUpperCase();
    const base = (instrumentInfo?.base_currency || (sym.length >= 6 ? sym.slice(0, 3) : '')).toUpperCase();
    const quote = (instrumentInfo?.quote_currency || (sym.length >= 6 ? sym.slice(3, 6) : '')).toUpperCase();
    const toUsd = quoteToUsdFactor(base, quote, referencePrice, useTradingStore.getState().prices);
    if (toUsd == null) return 0;
    return lotsNum * contractSize * toUsd * accountCurrencyFactor(activeAccount?.currency, usdInrRate);
  }, [referencePrice, lotsNum, selectedSymbol, instrumentInfo, contractSize, activeAccount?.currency, usdInrRate]);

  const ctx: SlTpCtx = {
    side,
    entry: referencePrice,
    pipSize,
    digits,
    moneyPerPrice,
    equity: activeAccount?.equity || 0,
  };
  const entryLabel = orderTab === 'pending' ? 'open price' : 'current price';
  // undefined = not set, null = typed but not convertible to a price
  const levelPrice = (kind: SlTpKind, s: SlTpState) =>
    s.value === '' ? undefined : slTpToPrice(kind, s.mode, parseFloat(s.value), ctx);
  const levelError = (kind: SlTpKind, s: SlTpState, p: number | null | undefined) => {
    if (s.value === '') return null;
    if (p == null) return `Enter a valid ${kind === 'tp' ? 'take profit' : 'stop loss'}`;
    return slTpSideError(kind, p, ctx, entryLabel);
  };
  const tpPrice = levelPrice('tp', tp);
  const slPrice = levelPrice('sl', sl);
  const tpError = levelError('tp', tp, tpPrice);
  const slError = levelError('sl', sl, slPrice);

  /** Spread cost of this volume in account currency (falls back to pips). */
  const spreadCost = tick ? (tick.ask - tick.bid) * moneyPerPrice : 0;

  useEffect(() => {
    const unsub = wsManager.onStatusChange(setWsStatus);
    setWsStatus(wsManager.status);
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!orderFormCloneDraft) return;
    const d = orderFormCloneDraft;
    const asLevel = (v: number | null | undefined): SlTpState =>
      v != null && !Number.isNaN(Number(v)) ? { mode: 'price', value: String(v) } : EMPTY_LEVEL;
    setSelectedSymbol(d.symbol);
    setSide(d.side);
    setLots(Math.max(0.01, Number(d.lots.toFixed(4))).toString());
    setSl(asLevel(d.stop_loss));
    setTp(asLevel(d.take_profit));
    setOrderTab('market');
    setOrderFormCloneDraft(null);
    setTerminalMarketsOpen(false);
    setTerminalNewsOpen(false);
    toast.success('Order form filled — review and place');
  }, [orderFormCloneDraft, setSelectedSymbol, setOrderFormCloneDraft, setTerminalMarketsOpen, setTerminalNewsOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSymbolPickerOpen(false);
      }
    }
    if (symbolPickerOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [symbolPickerOpen]);

  const adjustLots = (delta: number) => {
    setLots(Math.max(0.01, parseFloat((lotsNum + delta).toFixed(2))).toFixed(2));
  };

  // Seed open price when entering Pending tab or when side/symbol changes there.
  // Tick is intentionally omitted so live ticks don't overwrite a user's edit.
  useEffect(() => {
    if (orderTab !== 'pending') return;
    if (!tick) return;
    const ref = side === 'buy' ? tick.ask : tick.bid;
    if (ref > 0) setOpenPrice(ref.toFixed(digits));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTab, side, selectedSymbol]);

  const adjustOpenPrice = (delta: number) => {
    const fallback = side === 'buy' ? tick?.ask : tick?.bid;
    const cur = openPriceNum || fallback || 0;
    const next = Math.max(0, cur + delta);
    setOpenPrice(next.toFixed(digits));
  };

  const resetForm = () => {
    setTp(EMPTY_LEVEL);
    setSl(EMPTY_LEVEL);
    setLots('0.01');
    setOrderTab('market');
  };

  const handleSubmit = async () => {
    unlockAudio();
    if (!activeAccount || submitting) return;

    // All validation BEFORE setSubmitting — an early return after it left the
    // button disabled until a page reload.
    if (!Number.isFinite(lotsNum) || lotsNum <= 0) {
      toast.error('Enter a valid lot size');
      return;
    }
    if (orderTab === 'market' && !marketStatus.isOpen) {
      toast.error(marketStatus.reason || 'Market is closed');
      return;
    }
    // Snapshot the type *before* the await — a live tick crossing the open
    // price between this click and the api.post could otherwise flip it.
    let pendingTypeAtSubmit: 'limit' | 'stop' | null = null;
    if (orderTab === 'pending') {
      if (!Number.isFinite(openPriceNum) || openPriceNum <= 0) {
        toast.error('Set open price');
        return;
      }
      if (!tick) {
        toast.error('Waiting for price feed — try again');
        return;
      }
      pendingTypeAtSubmit = derivedPendingType;
      if (!pendingTypeAtSubmit) {
        toast.error(
          side === 'buy'
            ? `Open price ${openPriceNum.toFixed(digits)} equals ask — move below for Limit, above for Stop`
            : `Open price ${openPriceNum.toFixed(digits)} equals bid — move above for Limit, below for Stop`,
        );
        return;
      }
    }
    // SL/TP: same rules the fields show inline, measured from the exec price
    // (market) or the open price (pending — the server skips that check).
    const levelErr = tpError || slError;
    if (levelErr) {
      toast.error(levelErr);
      return;
    }
    if (!hasEnoughMargin) {
      toast.error('Insufficient margin');
      return;
    }
    setSubmitting(true);

    // Optimistic: instant feedback, API fires in background.
    sounds.orderPlaced();
    const sideLabel =
      orderTab === 'pending' && pendingTypeAtSubmit
        ? `${side.toUpperCase()} ${pendingTypeAtSubmit.toUpperCase()}`
        : side.toUpperCase();
    toast.success(`${sideLabel} ${lotsNum} ${selectedSymbol}`);

    // Only market orders hit the book immediately — show the position in
    // the panel without waiting for the API round-trip.
    const optimisticId = `optim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    let rollback: (() => void) | null = null;
    if (orderTab === 'market') {
      const optimisticPos = {
        id: optimisticId,
        account_id: activeAccount.id,
        symbol: selectedSymbol,
        side,
        lots: lotsNum,
        open_price: execPrice,
        current_price: execPrice,
        stop_loss: slPrice ?? undefined,
        take_profit: tpPrice ?? undefined,
        swap: 0,
        commission: 0,
        profit: 0,
        trade_type: 'market',
        created_at: new Date().toISOString(),
      } as (typeof positions)[number];
      const prev = positions;
      setPositions([optimisticPos, ...prev]);
      rollback = () => setPositions(prev);
    }

    api.post('/orders/', {
      account_id: activeAccount.id,
      symbol: selectedSymbol,
      order_type: orderTab === 'market' ? 'market' : pendingTypeAtSubmit!,
      side,
      lots: lotsNum,
      price: orderTab === 'pending' ? openPriceNum : undefined,
      stop_loss: slPrice ?? undefined,
      take_profit: tpPrice ?? undefined,
    }).then(() => {
      // Reconcile with server-authoritative state (replaces the optimistic row).
      const refreshes: Promise<unknown>[] = [refreshAccount()];
      if (orderTab === 'market') refreshes.push(refreshPositions());
      else refreshes.push(refreshPendingOrders());
      Promise.all(refreshes).catch(() => {});
    }).catch((e: any) => {
      if (rollback) rollback();
      toast.error(e.message || 'Order failed');
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const isConnected = wsStatus === 'connected';
  const sideColor = side === 'buy' ? BUY : SELL;
  const sideWord = side === 'buy' ? 'Buy' : 'Sell';
  const submitDisabled =
    submitting ||
    !hasEnoughMargin ||
    !activeAccount ||
    (orderTab === 'market' && !marketStatus.isOpen) ||
    pendingInvalid ||
    Boolean(tpError || slError);

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-bg-base">
      {/* ═══ Header ═══ */}
      <div className="shrink-0 flex items-center justify-between border-b border-border-primary bg-bg-secondary px-2 py-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="relative flex items-center gap-1.5 min-w-0" ref={dropdownRef}>
            <div
              className="rounded-full shrink-0 w-3.5 h-3.5"
              style={{ background: 'linear-gradient(135deg, #ffb300, #42a5f5)' }}
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setSymbolPickerOpen((o) => !o)}
              className="flex items-center gap-1 hover:bg-white/[0.05] py-1 pl-0 pr-0.5 rounded-lg transition-colors min-w-0"
            >
              <span className="font-bold text-text-primary font-mono truncate text-xs">{selectedSymbol}</span>
              <ChevronDown
                size={12}
                className={clsx('text-text-tertiary shrink-0 transition-transform', symbolPickerOpen && 'rotate-180')}
              />
            </button>
            {symbolPickerOpen && (
              <div className="absolute top-full left-0 z-50 w-64 mt-1 rounded-lg border border-border-primary shadow-2xl bg-bg-secondary overflow-hidden">
                <OrderPanelSymbolPicker
                  onPick={(sym) => {
                    setSelectedSymbol(sym);
                    setSymbolPickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSymbolPickerOpen(false);
                toggleTerminalMarkets();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-accent/40 text-accent hover:bg-accent/12 transition-colors"
              aria-label={terminalMarketsOpen ? 'Hide markets' : 'Open markets'}
              aria-expanded={terminalMarketsOpen}
            >
              <ChevronLeft
                className={clsx('w-3.5 h-3.5 transition-transform duration-200', terminalMarketsOpen && '-rotate-90')}
              />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Markets</span>
            </button>
            <button
              type="button"
              title={oneClickTrading ? 'One-click trading on' : 'One-click trading off'}
              aria-label={oneClickTrading ? 'Disable one-click trading' : 'Enable one-click trading'}
              aria-pressed={oneClickTrading}
              onClick={() => setOneClickTrading(!oneClickTrading)}
              className={clsx(
                'flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
                oneClickTrading
                  ? 'border-accent/50 bg-accent/15 text-accent'
                  : 'border-border-secondary text-text-tertiary hover:text-text-primary hover:bg-bg-hover',
              )}
            >
              <Zap size={15} strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AccountSwitcher compact />
        </div>
      </div>
      <div className="h-px w-full shrink-0 bg-accent" aria-hidden />

      {/* ═══ Order form ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        <div className="px-2.5 pt-2.5 pb-2 space-y-2">
          {/* Sell / Buy price cards + spread badge */}
          <div className="relative grid grid-cols-2 gap-1.5">
            <SidePriceCard side="sell" active={side === 'sell'} price={tick?.bid} digits={digits} onClick={() => setSide('sell')} />
            <SidePriceCard side="buy" active={side === 'buy'} price={tick?.ask} digits={digits} onClick={() => setSide('buy')} />
            {tick && (
              <span
                className="absolute left-1/2 -bottom-2.5 -translate-x-1/2 z-10 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold whitespace-nowrap bg-bg-base border border-border-primary text-text-secondary"
                title="Spread cost for this volume"
              >
                {spreadCost > 0 ? `${spreadCost.toFixed(2)} ${ccy}` : `${(tick.spread / pipSize).toFixed(1)} pips`}
              </span>
            )}
          </div>

          {/* Market / Pending */}
          <div className="!mt-4 flex p-0.5 rounded-lg bg-bg-secondary border border-border-primary">
            {(['market', 'pending'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderTab(t)}
                aria-pressed={orderTab === t}
                className={clsx(
                  'flex-1 py-1 rounded-md text-xs font-semibold capitalize transition-colors',
                  orderTab === t
                    ? 'bg-bg-hover text-text-primary shadow-sm'
                    : 'text-text-tertiary hover:text-text-secondary',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Open price — pending only */}
          {orderTab === 'pending' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-text-secondary">Open price</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    color: derivedPendingType === 'stop' ? '#ffb300' : BUY,
                    background: derivedPendingType === 'stop' ? 'rgba(255,179,0,0.12)' : 'rgba(33,150,243,0.12)',
                    border: `1px solid ${derivedPendingType === 'stop' ? 'rgba(255,179,0,0.3)' : 'rgba(33,150,243,0.3)'}`,
                    opacity: derivedPendingType ? 1 : 0.5,
                  }}
                >
                  {derivedPendingType || 'limit'}
                </span>
              </div>
              <StepperField
                value={openPrice}
                ariaLabel="Open price"
                onChange={(v) => {
                  // Reject bare "." / "1.2.3" / non-digits so submit always parses.
                  if (v === '' || /^\d+(\.\d*)?$/.test(v)) setOpenPrice(v);
                }}
                onBlur={() => {
                  const n = parseFloat(openPrice);
                  if (Number.isFinite(n) && n > 0) setOpenPrice(n.toFixed(digits));
                  else if (openPrice !== '') setOpenPrice('');
                }}
                onStep={(dir) => adjustOpenPrice(dir * pipSize)}
                placeholder={execPrice > 0 ? execPrice.toFixed(digits) : '0.00'}
                invalid={openPriceNum > 0 && !derivedPendingType}
              />
              {openPriceNum > 0 && !derivedPendingType && tick ? (
                <div className="mt-0.5 text-[10px] leading-tight text-[#ef5350]">
                  {side === 'buy' ? 'Move below ask for Limit, above for Stop' : 'Move above bid for Limit, below for Stop'}
                </div>
              ) : pendingPipsDiff !== null && Number.isFinite(pendingPipsDiff) ? (
                <div className="mt-0.5 text-[10px] leading-tight font-mono text-text-tertiary">
                  {pendingPipsDiff > 0 ? '+' : ''}
                  {pendingPipsDiff.toFixed(1)} pips from market
                </div>
              ) : null}
            </div>
          )}

          {/* Volume */}
          <div>
            <div className="mb-1 text-[11px] font-semibold text-text-secondary">Volume</div>
            <StepperField
              value={lots}
              ariaLabel="Volume in lots"
              onChange={(v) => {
                if (v === '' || /^\d*\.?\d{0,2}$/.test(v)) setLots(v);
              }}
              onBlur={() => {
                const n = parseFloat(lots);
                setLots(!Number.isFinite(n) || n <= 0 ? '0.01' : n.toFixed(2));
              }}
              onStep={(dir) => adjustLots(dir * 0.01)}
              suffix={<span className="self-center px-2 text-[11px] text-text-tertiary">Lots</span>}
            />
          </div>

          <SlTpField kind="tp" state={tp} onChange={setTp} ctx={ctx} price={tpPrice} error={tpError} ccy={ccy} />
          <SlTpField kind="sl" state={sl} onChange={setSl} ctx={ctx} price={slPrice} error={slError} ccy={ccy} />
        </div>
      </div>

      {/* ═══ Summary + confirm ═══ */}
      <div className="shrink-0 border-t border-border-primary bg-bg-secondary px-2.5 pt-1.5 pb-2 space-y-1.5">
        <div className="grid grid-cols-3 gap-1 text-[10px] leading-tight">
          <InfoCell label="Leverage">
            {activeAccount ? (
              <LeveragePicker account={activeAccount} onChanged={() => { void refreshAccount(); }} />
            ) : '—'}
          </InfoCell>
          <InfoCell label="Margin" valueClass={!hasEnoughMargin ? 'text-[#ef5350]' : undefined}>
            {formatMoney(marginRequired, ccy)}
          </InfoCell>
          <InfoCell label="Free margin" valueClass={!hasEnoughMargin ? 'text-[#ef5350]' : undefined} align="right">
            <span className="inline-flex items-center gap-1">
              {formatMoney(freeMargin, ccy)}
              <span
                className={clsx('text-[8px]', isConnected ? 'text-[#2196f3]' : 'text-[#f57c00]')}
                title={isConnected ? 'Price feed connected' : 'Price feed disconnected'}
              >
                {isConnected ? '●' : '○'}
              </span>
            </span>
          </InfoCell>
        </div>
        {!hasEnoughMargin && (
          <div className="text-[10px] text-[#ef5350] font-semibold text-center leading-tight">Insufficient margin</div>
        )}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitDisabled}
            className="flex-1 min-w-0 py-2.5 rounded-lg text-[13px] font-bold truncate transition-transform duration-75 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
            style={{ background: sideColor, color: '#fff', boxShadow: `0 2px 12px ${sideColor}33` }}
          >
            {orderTab === 'pending' && derivedPendingType
              ? `Place ${sideWord} ${derivedPendingType === 'limit' ? 'Limit' : 'Stop'} · ${lotsNum.toFixed(2)}`
              : `Confirm ${sideWord} · ${lotsNum.toFixed(2)} lots`}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="shrink-0 px-3 rounded-lg text-xs font-semibold text-text-secondary bg-bg-base border border-border-primary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
        </div>
        {!marketStatus.isOpen && orderTab === 'market' && (
          <div
            className="rounded px-2 py-1 text-[10px] text-red-400 leading-snug text-center"
            style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)' }}
          >
            {marketStatus.reason}
          </div>
        )}
      </div>
    </div>
  );
}

/** Sell / Buy card: selected side is filled with its colour, the other is outlined. */
function SidePriceCard({
  side,
  active,
  price,
  digits,
  onClick,
}: {
  side: OrderSide;
  active: boolean;
  price: number | undefined;
  digits: number;
  onClick: () => void;
}) {
  const color = side === 'buy' ? BUY : SELL;
  const { main, big, sup } = splitPrice(price ?? 0, digits);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="min-w-0 rounded-lg px-2.5 pt-1.5 pb-3 text-left transition-colors active:scale-[0.98]"
      style={
        active
          ? { background: color, border: `1px solid ${color}`, color: '#fff' }
          : { background: `${color}14`, border: `1px solid ${color}`, color }
      }
    >
      <div className="text-[11px] font-semibold leading-none">{side === 'buy' ? 'Buy' : 'Sell'}</div>
      <div className="mt-1 font-mono leading-none whitespace-nowrap overflow-hidden">
        <span className="text-[13px]">{main}</span>
        <span className="text-[20px] font-bold">{big}</span>
        {sup && <sup className="ml-px text-[11px]">{sup}</sup>}
      </div>
    </button>
  );
}

/** Input with optional suffix (unit / mode picker) and attached −/+ buttons. */
function StepperField({
  value,
  onChange,
  onBlur,
  onStep,
  placeholder,
  suffix,
  invalid,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  onStep: (dir: 1 | -1) => void;
  placeholder?: string;
  suffix?: ReactNode;
  invalid?: boolean;
  ariaLabel: string;
}) {
  const stepBtn =
    'w-8 shrink-0 flex items-center justify-center border-l border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors';
  return (
    <div
      className={clsx(
        'flex items-stretch h-8 rounded-md border bg-bg-secondary transition-colors',
        invalid ? 'border-[#ef5350]/70' : 'border-border-primary focus-within:border-[#2196f3]/70',
      )}
    >
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="flex-1 min-w-0 bg-transparent px-2.5 text-[13px] font-mono font-semibold text-text-primary placeholder:font-sans placeholder:font-normal placeholder:text-text-tertiary focus:outline-none"
      />
      {suffix}
      <button type="button" onClick={() => onStep(-1)} aria-label={`Decrease ${ariaLabel}`} className={stepBtn}>
        <Minus size={13} />
      </button>
      <button type="button" onClick={() => onStep(1)} aria-label={`Increase ${ariaLabel}`} className={clsx(stepBtn, 'rounded-r-md')}>
        <Plus size={13} />
      </button>
    </div>
  );
}

/** Take profit / stop loss typed by price, pips, money or % of equity. */
function SlTpField({
  kind,
  state,
  onChange,
  ctx,
  price,
  error,
  ccy,
}: {
  kind: SlTpKind;
  state: SlTpState;
  onChange: (s: SlTpState) => void;
  ctx: SlTpCtx;
  price: number | null | undefined;
  error: string | null;
  ccy: string;
}) {
  const isSet = state.value !== '';
  const label = kind === 'tp' ? 'Take Profit' : 'Stop Loss';
  const fmt = (mode: SlTpMode, v: number) => v.toFixed(mode === 'price' ? ctx.digits : mode === 'pips' ? 1 : 2);
  const unit = state.mode === 'price' ? 'Price' : state.mode === 'pips' ? 'Pips' : state.mode === 'money' ? ccy : '%';

  const switchMode = (mode: SlTpMode) => {
    if (mode === state.mode) return;
    // Keep the same level: convert the current value through its price.
    const v = isSet && price != null ? priceToSlTp(mode, price, ctx) : null;
    onChange({ mode, value: v != null && v > 0 ? fmt(mode, v) : '' });
  };

  const step = (dir: 1 | -1) => {
    const cur = parseFloat(state.value);
    let next: number | null;
    if (!isSet || !Number.isFinite(cur)) {
      // First tap: start 50 pips from entry, shown in the current mode.
      const p = slTpToPrice(kind, 'pips', 50, ctx);
      next = p == null ? null : priceToSlTp(state.mode, p, ctx);
    } else {
      next = cur + dir * slTpStep(state.mode, ctx.pipSize);
    }
    if (next != null && next > 0) onChange({ ...state, value: fmt(state.mode, next) });
  };

  const outcome = price != null && !error ? slTpOutcome(price, ctx) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-text-secondary">{label}</span>
        {isSet && (
          <button
            type="button"
            onClick={() => onChange({ ...state, value: '' })}
            className="flex items-center gap-0.5 text-[10px] text-text-tertiary hover:text-text-primary"
            aria-label={`Clear ${label}`}
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>
      <StepperField
        value={state.value}
        ariaLabel={label}
        onChange={(v) => {
          if (v === '' || /^\d*\.?\d*$/.test(v)) onChange({ ...state, value: v });
        }}
        onStep={step}
        placeholder="Not set"
        invalid={Boolean(error)}
        suffix={<ModeSelect mode={state.mode} unit={unit} onPick={switchMode} />}
      />
      {error ? (
        <div className="mt-0.5 text-[10px] leading-tight text-[#ef5350]">{error}</div>
      ) : outcome && price != null ? (
        <div className="mt-0.5 text-[10px] leading-tight font-mono text-text-tertiary truncate">
          {state.mode !== 'price' && <>Price {price.toFixed(ctx.digits)} · </>}
          {outcome.pips >= 0 ? '+' : ''}
          {outcome.pips.toFixed(1)} pips ·{' '}
          <span style={{ color: outcome.money >= 0 ? BUY : SELL }}>
            {outcome.money >= 0 ? '+' : '−'}
            {Math.abs(outcome.money).toFixed(2)} {ccy}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function ModeSelect({ mode, unit, onPick }: { mode: SlTpMode; unit: string; onPick: (m: SlTpMode) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-0.5 px-2 border-l border-border-primary text-[11px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
      >
        {unit}
        <ChevronDown size={11} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border-primary py-1 shadow-xl"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
        >
          {(Object.keys(SLTP_MODE_LABELS) as SlTpMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="option"
              aria-selected={m === mode}
              onClick={() => {
                onPick(m);
                setOpen(false);
              }}
              className={clsx(
                'w-full text-left px-3 py-1.5 text-[12px] transition-colors',
                m === mode
                  ? 'bg-[#2196f3]/10 text-[#2196f3] font-semibold'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
              )}
            >
              {SLTP_MODE_LABELS[m]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoCell({
  label,
  children,
  valueClass,
  align = 'left',
}: {
  label: string;
  children: ReactNode;
  valueClass?: string;
  align?: 'left' | 'right';
}) {
  return (
    <div className={clsx('min-w-0 flex flex-col', align === 'right' ? 'items-end text-right' : 'items-start')}>
      <span className="text-text-tertiary">{label}</span>
      <span className={clsx('font-mono font-semibold text-text-primary truncate max-w-full', valueClass)}>{children}</span>
    </div>
  );
}

/**
 * Dropdown that lets the trader lower their leverage to any preset value up to
 * the admin-set `account_group.leverage_default` ceiling. Persists the change
 * via PATCH /accounts/:id/leverage.
 */
function LeveragePicker({
  account,
  onChanged,
}: {
  account: TradingAccount;
  onChanged: () => void;
}) {
  const setActiveAccount = useTradingStore((s) => s.setActiveAccount);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const maxLev = account.account_group?.leverage_default ?? account.leverage;
  const presets = useMemo(() => {
    const base = [1, 10, 25, 50, 100, 200, 300, 400, 500, 1000];
    const filtered = base.filter((v) => v <= maxLev);
    if (!filtered.includes(maxLev)) filtered.push(maxLev);
    return Array.from(new Set(filtered)).sort((a, b) => a - b);
  }, [maxLev]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const apply = async (lev: number) => {
    if (lev === account.leverage) { setOpen(false); return; }
    setSaving(true);
    try {
      await api.patch(`/accounts/${account.id}/leverage`, { leverage: lev });
      // Optimistic local update so the pill reflects the new value immediately.
      setActiveAccount({ ...account, leverage: lev });
      toast.success(`Leverage set to 1:${lev}`);
      onChanged();
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change leverage');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        disabled={saving}
        className="inline-flex items-center gap-0.5 rounded text-[10px] font-mono font-semibold text-text-primary hover:text-[#2196f3] transition-colors disabled:opacity-50"
        title={`Max 1:${maxLev} — click to change`}
      >
        1:{account.leverage}
        <ChevronDown size={10} />
      </button>
      {open && (
        <div
          className="absolute left-0 bottom-full mb-1 w-28 rounded-lg border border-border-primary shadow-xl py-1"
          style={{
            backgroundColor: 'var(--bg-card)',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <div className="px-2 pb-1 pt-0.5 text-[9px] uppercase tracking-wider text-text-tertiary font-bold border-b border-border-primary mb-1">
            Max 1:{maxLev}
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {presets.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => void apply(v)}
                className={clsx(
                  'w-full text-left px-2 py-1 text-[11px] font-mono transition-colors',
                  v === account.leverage
                    ? 'bg-[#2196f3]/15 text-[#2196f3] font-bold'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                )}
              >
                1:{v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
