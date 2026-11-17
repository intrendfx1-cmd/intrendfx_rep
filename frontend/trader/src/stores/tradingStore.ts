import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api/client';

export interface TickData {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: string;
  spread: number;
}

export interface Position {
  id: string;
  account_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  lots: number;
  open_price: number;
  current_price?: number;
  stop_loss?: number;
  take_profit?: number;
  swap: number;
  commission: number;
  profit: number;
  /** copy_trade | self_trade when API provides it (open positions / copy trading). */
  trade_type?: string;
  created_at: string;
}

export interface PendingOrder {
  id: string;
  account_id: string;
  symbol: string;
  order_type: string;
  side: 'buy' | 'sell';
  status: string;
  lots: number;
  price: number;
  stop_loss?: number;
  take_profit?: number;
  created_at: string;
}

/** Account type (account_groups) — spreads / commission / min deposit configured in admin. */
export interface AccountGroupInfo {
  id: string;
  name: string;
  spread_markup: number;
  commission_per_lot: number;
  minimum_deposit: number;
  swap_free: boolean;
  leverage_default: number;
}

export interface TradingAccount {
  id: string;
  account_number: string;
  balance: number;
  credit: number;
  equity: number;
  margin_used: number;
  free_margin: number;
  margin_level: number;
  leverage: number;
  currency: string;
  is_demo: boolean;
  account_group?: AccountGroupInfo | null;
}

export interface InstrumentInfo {
  symbol: string;
  display_name: string;
  segment: string;
  digits: number;
  pip_size: number;
  min_lot: number;
  max_lot: number;
  lot_step: number;
  contract_size: number;
  base_currency?: string | null;
  quote_currency?: string | null;
}

/** One-shot prefill for order panel (clone from open position). */
export type OrderFormCloneDraft = {
  symbol: string;
  side: 'buy' | 'sell';
  lots: number;
  stop_loss?: number | null;
  take_profit?: number | null;
};

interface TradingState {
  activeAccount: TradingAccount | null;
  accounts: TradingAccount[];
  positions: Position[];
  pendingOrders: PendingOrder[];
  selectedSymbol: string;
  /** Live USD→INR rate for P&L conversion on INR accounts. 1 for USD. */
  usdInrRate: number;
  prices: Record<string, TickData>;
  prevPrices: Record<string, number>;
  watchlist: string[];
  instruments: InstrumentInfo[];

  setActiveAccount: (a: TradingAccount | null) => void;
  setAccounts: (a: TradingAccount[]) => void;
  setPositions: (p: Position[]) => void;
  setPendingOrders: (o: PendingOrder[]) => void;
  setSelectedSymbol: (s: string) => void;
  updatePrice: (t: TickData) => void;
  addToWatchlist: (s: string) => void;
  removeFromWatchlist: (s: string) => void;
  setInstruments: (i: InstrumentInfo[]) => void;
  removePosition: (id: string) => void;
  removeAccount: (id: string) => void;
  refreshPositions: () => Promise<void>;
  refreshPendingOrders: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  placeOrder: (data: {
    account_id: string;
    symbol: string;
    side: 'buy' | 'sell';
    order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
    lots: number;
    price?: number;
    stop_loss?: number;
    take_profit?: number;
    stop_limit_price?: number;
  }) => Promise<any>;

  orderFormCloneDraft: OrderFormCloneDraft | null;
  setOrderFormCloneDraft: (d: OrderFormCloneDraft | null) => void;
  setUsdInrRate: (r: number) => void;
  refreshFxRate: () => Promise<void>;
}

// Track positions the user has just closed (optimistically removed from UI).
// The backend's close pipeline can take a few hundred ms, so a refresh that
// fires in the meantime would otherwise return the position as still open and
// re-insert it into the list — making the row visibly bounce back and tricking
// the user into clicking CLOSE again. Entries auto-expire after 8s.
const recentlyClosedIds = new Map<string, number>();
const RECENTLY_CLOSED_TTL_MS = 8_000;

const pruneClosed = () => {
  const cutoff = Date.now() - RECENTLY_CLOSED_TTL_MS;
  for (const [k, ts] of recentlyClosedIds) {
    if (ts < cutoff) recentlyClosedIds.delete(k);
  }
};

/** True if the given position id was closed by the user via the UI within the
 *  TTL window. Used by the position poll to skip the per-position sound for
 *  user-initiated closes — those already get a single summary sound from the
 *  close action itself, so playing again per disappearing row is noise. */
export const wasRecentlyClosedByUser = (id: string): boolean => {
  pruneClosed();
  return recentlyClosedIds.has(id);
};

const DEFAULT_WATCHLIST = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD',
  'XAUUSD', 'XAGUSD', 'USOIL', 'BTCUSD', 'ETHUSD', 'SOLUSD',
  'US30', 'NAS100', 'GER40', 'EURJPY', 'GBPJPY',
];

// Multiplier that converts a P&L expressed in an instrument's QUOTE currency
// into USD. Returns null when the rate can't be determined from the live price
// map — callers must then leave the server-provided profit untouched rather
// than render a wrong number.
//   • quote === USD                 → 1            (EURUSD, XAUUSD, BTCUSD…)
//   • base  === USD (USDJPY, USDCAD)→ 1 / price    (P&L is in the quote ccy)
//   • cross (EURJPY, GBPJPY, EURGBP)→ via USDxxx or xxxUSD live price
function quoteToUsdFactor(
  base: string,
  quote: string,
  currentPrice: number,
  prices: Record<string, { bid: number; ask: number }>,
): number | null {
  if (!quote || quote === 'USD') return 1;
  if (base === 'USD') return currentPrice > 0 ? 1 / currentPrice : null;
  const usdQuote = prices['USD' + quote];
  if (usdQuote) {
    const m = (Number(usdQuote.bid) + Number(usdQuote.ask)) / 2;
    if (m > 0) return 1 / m;
  }
  const quoteUsd = prices[quote + 'USD'];
  if (quoteUsd) {
    const m = (Number(quoteUsd.bid) + Number(quoteUsd.ask)) / 2;
    if (m > 0) return m;
  }
  return null;
}

// Factor that converts a USD amount into the ACTIVE account's currency.
// Gated on the account currency (not just "rate > 1") so a stale INR rate can
// never blow up P&L on a USD account, and vice-versa.
function accountCurrencyFactor(
  accountCurrency: string | undefined,
  usdInrRate: number,
): number {
  const ccy = (accountCurrency || 'USD').toUpperCase();
  if (ccy === 'USD') return 1;
  return Number.isFinite(usdInrRate) && usdInrRate > 1 ? usdInrRate : 1;
}

const DEFAULT_SYMBOL = 'XAUUSD';
const SYMBOL_STORAGE_KEY = 'intrendfx-selected-symbol';

function getPersistedSymbol(): string {
  if (typeof window === 'undefined') return DEFAULT_SYMBOL;
  try {
    return sessionStorage.getItem(SYMBOL_STORAGE_KEY) || DEFAULT_SYMBOL;
  } catch {
    return DEFAULT_SYMBOL;
  }
}

export const useTradingStore = create<TradingState>()((set, get) => ({
  activeAccount: null,
  accounts: [],
  positions: [],
  pendingOrders: [],
  selectedSymbol: getPersistedSymbol(),
  usdInrRate: 1,
  prices: {},
  prevPrices: {},
  watchlist: DEFAULT_WATCHLIST,
  instruments: [],
  orderFormCloneDraft: null,

  setUsdInrRate: (r) => set({ usdInrRate: r }),
  refreshFxRate: async () => {
    const acct = get().activeAccount;
    if (!acct || (acct.currency || 'USD') === 'USD') {
      set({ usdInrRate: 1 });
      return;
    }
    try {
      const res = await api.get<{ raw_rate?: string; rate?: string }>('/wallet/fx-rate');
      const raw = parseFloat(res.raw_rate || res.rate || '1');
      if (Number.isFinite(raw) && raw > 0) set({ usdInrRate: raw });
    } catch {}
  },

  setActiveAccount: (a) => set({ activeAccount: a }),
  setAccounts: (a) => set({ accounts: a }),
  setPositions: (p) => set({ positions: p }),
  setPendingOrders: (o) => set({ pendingOrders: o }),
  setSelectedSymbol: (s) => {
    set({ selectedSymbol: s });
    try { sessionStorage.setItem(SYMBOL_STORAGE_KEY, s); } catch {}
  },
  setInstruments: (i) => set({ instruments: i }),
  setOrderFormCloneDraft: (d) => set({ orderFormCloneDraft: d }),
  removePosition: (id) => {
    recentlyClosedIds.set(id, Date.now());
    pruneClosed();
    set((s) => ({ positions: s.positions.filter((p) => p.id !== id) }));
  },

  removeAccount: (id) =>
    set((s) => ({
      accounts: s.accounts.filter((a) => a.id !== id),
      activeAccount: s.activeAccount?.id === id ? null : s.activeAccount,
    })),

  refreshPositions: async () => {
    const account = get().activeAccount;
    if (!account) return;
    try {
      const positions = await api.get<any[]>(`/positions/`, { account_id: account.id, status: 'open' });
      const list = Array.isArray(positions) ? positions : [];
      pruneClosed();
      // Convert the server's USD figures into the active account's currency.
      // Gated on the account currency so a stale rate never mis-scales P&L.
      const fxRate = accountCurrencyFactor(get().activeAccount?.currency, get().usdInrRate);
      const mapped = list
        .map((p: any) => {
          const rawProfit = Number(p.profit) || 0;
          const rawSwap = Number(p.swap) || 0;
          const rawComm = Number(p.commission) || 0;
          return {
            id: p.id,
            account_id: p.account_id,
            symbol: p.symbol || '',
            side: p.side,
            lots: Number(p.lots) || 0,
            open_price: Number(p.open_price) || 0,
            current_price: p.current_price != null ? Number(p.current_price) : undefined,
            stop_loss: p.stop_loss != null ? Number(p.stop_loss) : undefined,
            take_profit: p.take_profit != null ? Number(p.take_profit) : undefined,
            swap: rawSwap * fxRate,
            commission: rawComm * fxRate,
            profit: rawProfit * fxRate,
            trade_type: p.trade_type,
            created_at: p.created_at,
          };
        })
        // Drop any rows the user just closed — backend may still report them
        // as open for a beat after the close API returns, and re-inserting
        // them here is what makes the row "come back" mid-close.
        .filter((p) => !recentlyClosedIds.has(String(p.id)));

      // Preserve recently-placed optimistic positions that the server's
      // order→position pipeline hasn't reflected yet. Without this, a refresh
      // fired right after placeOrder briefly wipes the new trade row, then it
      // reappears on the next refresh — a visible flicker.
      const now = Date.now();
      // Greedily claim a matching server row for each optimistic row by
      // account/symbol/side/lots. We deliberately do NOT compare created_at:
      // client and server clocks can differ (e.g. IST vs UTC), and the old
      // 30s-proximity match then failed, leaving the optimistic row on screen
      // as a duplicate next to the real one for up to 10s. Once a real row is
      // present we drop the optimistic one immediately — no duplicate.
      const claimed = new Set<number>();
      const carry = get().positions.filter((p) => {
        if (typeof p.id !== 'string' || !p.id.startsWith('optim-')) return false;
        const age = now - new Date(p.created_at).getTime();
        if (!Number.isFinite(age) || age > 10_000) return false; // server didn't ack in time
        const idx = mapped.findIndex(
          (m, i) =>
            !claimed.has(i) &&
            String(m.account_id) === String(p.account_id) &&
            m.symbol === p.symbol &&
            m.side === p.side &&
            Math.abs(m.lots - p.lots) < 0.001,
        );
        if (idx >= 0) {
          claimed.add(idx);
          return false; // real position present → drop the optimistic placeholder
        }
        return true; // keep until the server catches up (≤10s)
      });

      set({ positions: carry.length ? [...carry, ...mapped] : mapped });
    } catch {}
  },

  refreshPendingOrders: async () => {
    const account = get().activeAccount;
    if (!account) return;
    try {
      const orders = await api.get<any[]>(`/orders/`, { account_id: account.id, status: 'pending' });
      const list = Array.isArray(orders) ? orders : [];
      set({
        pendingOrders: list.map((row: any) => ({
          id: String(row.id),
          account_id: String(row.account_id),
          symbol: String(row.symbol || row.instrument?.symbol || ''),
          order_type: String(row.order_type),
          side: row.side,
          status: String(row.status),
          lots: Number(row.lots) || 0,
          price: Number(row.price) || 0,
          stop_loss: row.stop_loss != null ? Number(row.stop_loss) : undefined,
          take_profit: row.take_profit != null ? Number(row.take_profit) : undefined,
          created_at: String(row.created_at ?? ''),
        })),
      });
    } catch {}
  },

  refreshAccount: async () => {
    const account = get().activeAccount;
    if (!account) return;
    try {
      const res = await api.get<any>('/accounts');
      const items = Array.isArray(res) ? res : (res?.items ?? []);
      const updated = items.find((a: any) => a.id === account.id);
      if (updated) {
        set({
          activeAccount: {
            ...account,
            balance: Number(updated.balance) || 0,
            equity: Number(updated.equity) || 0,
            margin_used: Number(updated.margin_used) || 0,
            free_margin: Math.max(0, Number(updated.free_margin) || 0),
            credit: Number(updated.credit) || 0,
            margin_level: Number(updated.margin_level) || 0,
            leverage: Number(updated.leverage) || account.leverage,
            account_group: updated.account_group ?? account.account_group,
          },
        });
      }
    } catch {}
  },

  updatePrice: (tick) => set((state) => {
    const sym = String(tick.symbol || '').trim().toUpperCase();
    if (!sym) return state;
    const normalized: TickData = { ...tick, symbol: sym };
    const prev = state.prices[sym];
    // USD → account-currency factor, computed once (gated on account currency).
    const acctFactor = accountCurrencyFactor(state.activeAccount?.currency, state.usdInrRate);
    return {
      prevPrices: prev
        ? { ...state.prevPrices, [sym]: prev.bid }
        : state.prevPrices,
      prices: { ...state.prices, [sym]: normalized },
      positions: state.positions.map((pos) => {
        const pSym = String(pos.symbol || '').trim().toUpperCase();
        if (pSym !== sym) return pos;
        const cp = pos.side === 'buy' ? normalized.bid : normalized.ask;
        const inst =
          state.instruments.find((i) => i.symbol === sym) ||
          state.instruments.find((i) => String(i.symbol).toUpperCase() === sym);
        // Without a real contract size the P&L would be off by orders of
        // magnitude (e.g. gold's 100 vs the 100000 forex default). When the
        // instrument metadata isn't loaded yet, keep the server-provided profit
        // and only move the price — never render a guessed number.
        const cs = inst?.contract_size;
        if (!cs || cs <= 0) return { ...pos, current_price: cp };

        const base = (inst?.base_currency || (sym.length >= 6 ? sym.slice(0, 3) : '')).toUpperCase();
        const quote = (inst?.quote_currency || (sym.length >= 6 ? sym.slice(3, 6) : '')).toUpperCase();
        // Convert the quote-currency P&L to USD. If the cross rate isn't
        // available from the live price map, keep the server profit.
        const toUsd = quoteToUsdFactor(base, quote, cp, state.prices);
        if (toUsd == null) return { ...pos, current_price: cp };

        const pnlQuote = pos.side === 'buy'
          ? (cp - pos.open_price) * pos.lots * cs
          : (pos.open_price - cp) * pos.lots * cs;
        const profit = pnlQuote * toUsd * acctFactor;
        return { ...pos, current_price: cp, profit };
      }),
    };
  }),

  addToWatchlist: (s) => set((st) => ({
    watchlist: st.watchlist.includes(s) ? st.watchlist : [...st.watchlist, s],
  })),

  removeFromWatchlist: (s) => set((st) => ({
    watchlist: st.watchlist.filter((x) => x !== s),
  })),

  placeOrder: async (data) => {
    // Optimistic: market orders hit the book immediately — inject a position
    // row synchronously so the Positions panel reflects the trade without
    // waiting for the server round-trip.
    const s = get();
    const tick = s.prices[data.symbol];
    const optimisticId = `optim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    let rollback: (() => void) | null = null;
    if (data.order_type === 'market' && tick) {
      const execPrice = data.side === 'buy' ? tick.ask : tick.bid;
      const prev = s.positions;
      const optimisticPos = {
        id: optimisticId,
        account_id: data.account_id,
        symbol: data.symbol,
        side: data.side,
        lots: Number(data.lots) || 0,
        open_price: execPrice,
        current_price: execPrice,
        stop_loss: data.stop_loss,
        take_profit: data.take_profit,
        swap: 0,
        commission: 0,
        profit: 0,
        trade_type: 'self_trade',
        created_at: new Date().toISOString(),
      } as (typeof s.positions)[number];
      set({ positions: [optimisticPos, ...prev] });
      rollback = () => set({ positions: prev });
    }

    try {
      const res = await api.post<any>('/orders/', {
        account_id: data.account_id,
        symbol: data.symbol,
        side: data.side,
        order_type: data.order_type,
        lots: data.lots,
        price: data.price,
        stop_loss: data.stop_loss,
        take_profit: data.take_profit,
        stop_limit_price: data.stop_limit_price,
      });

      // Reconcile with server-authoritative state. The backend's order→position
      // pipeline can lag by a few hundred ms, so fire one refresh immediately
      // and another shortly after — refreshPositions preserves the optimistic
      // row until a matching real one shows up, so this catches both fast and
      // slow backends without flicker.
      get().refreshAccount().catch(() => {});
      get().refreshPositions().catch(() => {});
      setTimeout(() => {
        get().refreshPositions().catch(() => {});
        get().refreshAccount().catch(() => {});
      }, 600);

      return res;
    } catch (err) {
      if (rollback) rollback();
      throw err;
    }
  },
}));
