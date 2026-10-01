import { useSyncExternalStore } from "react";
import type { CardProduct } from "./types";

/**
 * Tiny external stores persisted to localStorage (cart, quote list, compare,
 * recently viewed). Safe to import from client components only; nothing touches
 * `window` until a store is read in the browser.
 */
export interface Store<T> {
  get: () => T;
  getServer: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(key: string | null, initial: T): Store<T> {
  let state = initial;
  let loaded = key === null;
  const listeners = new Set<() => void>();

  const load = (force = false) => {
    if (!key || typeof window === "undefined" || (loaded && !force)) return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      state = raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      state = initial;
    }
  };
  const emit = () => listeners.forEach((listener) => listener());

  return {
    get: () => {
      load();
      return state;
    },
    getServer: () => initial,
    set: (next) => {
      load();
      state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
      if (key) {
        try {
          window.localStorage.setItem(key, JSON.stringify(state));
        } catch {
          /* storage full or unavailable: keep in memory */
        }
      }
      emit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (key && event.key === key) {
          load(true);
          emit();
        }
      };
      if (key) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (key) window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

/* ---------------------------------------------------------------- line lists */

export interface Line extends CardProduct {
  qty: number;
}

export const MAX_QTY = 9999;
export const MAX_COMPARE = 4;

export const cartStore = createStore<Line[]>("catalog.cart.v1", []);
export const quoteStore = createStore<Line[]>("catalog.quote.v1", []);
export const compareStore = createStore<CardProduct[]>("catalog.compare.v1", []);
export const recentStore = createStore<CardProduct[]>("catalog.recent.v1", []);
export const uiStore = createStore<{ cartOpen: boolean; searchOpen: boolean }>(null, { cartOpen: false, searchOpen: false });

const clampQty = (qty: number) => Math.max(1, Math.min(MAX_QTY, Math.round(qty) || 1));

/** Keeps only CardProduct fields (listing items carry extra filter data). */
export function pickCard(p: CardProduct): CardProduct {
  return {
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    title: p.title,
    image: p.image,
    price: p.price,
    stock: p.stock,
    familyCode: p.familyCode,
    familyName: p.familyName,
    accessoryType: p.accessoryType,
    highlights: p.highlights,
  };
}

function lineActions(store: Store<Line[]>) {
  const add = (product: CardProduct, qty = 1) => {
    store.set((lines) => {
      const i = lines.findIndex((l) => l.sku === product.sku);
      if (i === -1) return [...lines, { ...pickCard(product), qty: clampQty(qty) }];
      const next = lines.slice();
      next[i] = { ...next[i], qty: clampQty(next[i].qty + qty) };
      return next;
    });
  };
  return {
    add,
    addMany(products: CardProduct[], qty = 1) {
      for (const product of products) add(product, qty);
    },
    setQty(sku: string, qty: number) {
      store.set((lines) => lines.map((l) => (l.sku === sku ? { ...l, qty: clampQty(qty) } : l)));
    },
    remove(sku: string) {
      store.set((lines) => lines.filter((l) => l.sku !== sku));
    },
    clear() {
      store.set([]);
    },
  };
}

export const cart = lineActions(cartStore);
export const quote = lineActions(quoteStore);

export const compare = {
  toggle(product: CardProduct): "added" | "removed" | "full" {
    const list = compareStore.get();
    if (list.some((p) => p.sku === product.sku)) {
      compareStore.set(list.filter((p) => p.sku !== product.sku));
      return "removed";
    }
    if (list.length >= MAX_COMPARE) return "full";
    compareStore.set([...list, pickCard(product)]);
    return "added";
  },
  remove(sku: string) {
    compareStore.set((list) => list.filter((p) => p.sku !== sku));
  },
  clear() {
    compareStore.set([]);
  },
};

export const recent = {
  push(product: CardProduct) {
    recentStore.set((list) => [pickCard(product), ...list.filter((p) => p.sku !== product.sku)].slice(0, 12));
  },
  clear() {
    recentStore.set([]);
  },
};

export const ui = {
  openCart: () => uiStore.set((s) => ({ ...s, cartOpen: true })),
  closeCart: () => uiStore.set((s) => ({ ...s, cartOpen: false })),
  openSearch: () => uiStore.set((s) => ({ ...s, searchOpen: true })),
  closeSearch: () => uiStore.set((s) => ({ ...s, searchOpen: false })),
};

/* ---------------------------------------------------------------- toasts */

export interface Toast {
  id: number;
  title: string;
  description?: string;
  image?: string | null;
  action?: { label: string; href?: string; onClick?: () => void };
}

export const toastStore = createStore<Toast[]>(null, []);
let toastId = 0;

export function dismissToast(id: number) {
  toastStore.set((list) => list.filter((t) => t.id !== id));
}

export function toast(input: Omit<Toast, "id">) {
  const id = ++toastId;
  toastStore.set((list) => [...list.slice(-2), { ...input, id }]);
  window.setTimeout(() => dismissToast(id), 4200);
}

export function subtotal(lines: Line[]): number {
  return lines.reduce((sum, l) => sum + (l.price ?? 0) * l.qty, 0);
}

export function itemCount(lines: Line[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}
