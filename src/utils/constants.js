import {
  Utensils, Car, ShoppingBag, HeartPulse, Receipt, Clapperboard,
  Plane, GraduationCap, Wallet, Package,
} from 'lucide-react';

// `color` is a CSS variable so category colors follow the active theme.
// Resolved values for charts come from useChartColors().cat.
export const CATS = [
  { id: 'food',          label: 'Food & Dining',     short: 'Food',          icon: Utensils },
  { id: 'transport',     label: 'Transport',         short: 'Transport',     icon: Car },
  { id: 'shopping',      label: 'Shopping',          short: 'Shopping',      icon: ShoppingBag },
  { id: 'health',        label: 'Health',            short: 'Health',        icon: HeartPulse },
  { id: 'bills',         label: 'Bills & Utilities', short: 'Bills',         icon: Receipt },
  { id: 'entertainment', label: 'Entertainment',     short: 'Entertainment', icon: Clapperboard },
  { id: 'travel',        label: 'Travel',            short: 'Travel',        icon: Plane },
  { id: 'education',     label: 'Education',         short: 'Education',     icon: GraduationCap },
  { id: 'income',        label: 'Income',            short: 'Income',        icon: Wallet },
  { id: 'other',         label: 'Other',             short: 'Other',         icon: Package },
].map(c => ({ ...c, color: `var(--cat-${c.id})` }));

export const CAT_MAP = Object.fromEntries(CATS.map(c => [c.id, c]));
export const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const CURRENCIES = [
  { s: '$',  l: 'USD – US Dollar' },
  { s: '€',  l: 'EUR – Euro' },
  { s: '£',  l: 'GBP – British Pound' },
  { s: '¥',  l: 'JPY – Japanese Yen' },
  { s: '₹',  l: 'INR – Indian Rupee' },
  { s: '₩',  l: 'KRW – South Korean Won' },
  { s: 'A$', l: 'AUD – Australian Dollar' },
  { s: 'C$', l: 'CAD – Canadian Dollar' },
];

export const formatMoney = (value, currency = '$', { decimals = 2 } = {}) =>
  `${currency}${Number(value || 0).toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

// "Sep 30", or "Sep 30, 2025" outside the current year. Accepts YYYY-MM-DD.
export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (isNaN(d)) return value;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
};

// Local-time YYYY-MM-DD / YYYY-MM. (toISOString() is UTC, which gives the
// previous day for anyone east of UTC shortly after midnight.)
const pad2 = n => String(n).padStart(2, '0');
export const toISODate  = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const toISOMonth = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
