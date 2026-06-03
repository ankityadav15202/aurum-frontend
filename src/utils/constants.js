export const CATS = [
  { id: 'food',          label: 'Food & Dining',    icon: '🍽️',  color: '#FF6B6B' },
  { id: 'transport',     label: 'Transport',         icon: '🚗',  color: '#4ECDC4' },
  { id: 'shopping',      label: 'Shopping',          icon: '🛍️',  color: '#A78BFA' },
  { id: 'health',        label: 'Health',            icon: '💊',  color: '#34D399' },
  { id: 'bills',         label: 'Bills & Utilities', icon: '💡',  color: '#FBBF24' },
  { id: 'entertainment', label: 'Entertainment',     icon: '🎬',  color: '#F472B6' },
  { id: 'travel',        label: 'Travel',            icon: '✈️',  color: '#60A5FA' },
  { id: 'education',     label: 'Education',         icon: '📚',  color: '#FB923C' },
  { id: 'income',        label: 'Income',            icon: '💰',  color: '#10B981' },
  { id: 'other',         label: 'Other',             icon: '📦',  color: '#94A3B8' },
];

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
