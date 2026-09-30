import { Link } from 'react-router-dom';
import { Monitor, Sun, Moon, X, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CAT_MAP } from '../../utils/constants.js';

export function Logo({ size, to }) {
  const { user } = useAuth();
  const href = to ?? (user ? (user.onboardingCompleted ? '/dashboard' : '/onboarding') : '/');
  return (
    <Link to={href} className={`logo${size === 'lg' ? ' lg' : ''}`} aria-label="Aurum home">
      <span className="logo-mark" aria-hidden="true">A</span>
      <span className="logo-word">Aurum</span>
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <Logo/>
        <nav>
          <Link to="/about">About</Link>
          <Link to="/features">Guide</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <div className="copy">© {new Date().getFullYear()} Aurum</div>
      </div>
    </footer>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function StatStrip({ items, cols }) {
  return (
    <div className="stat-strip" style={{ '--cols': cols || items.length }}>
      {items.map(s => (
        <div key={s.label} className="stat">
          <div className="stat-label">{s.label}</div>
          <div className="stat-value" style={s.tone ? { color: `var(--${s.tone})` } : undefined}>{s.value}</div>
          {s.sub && <div className="stat-sub">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}

export function CategoryIcon({ cat, size = 'md' }) {
  const c = CAT_MAP[cat] || CAT_MAP.other;
  const Icon = c.icon;
  return (
    <span className={`cat-icon${size === 'sm' ? ' sm' : ''}`} aria-hidden="true">
      <Icon size={size === 'sm' ? 14 : 17} strokeWidth={1.75} />
    </span>
  );
}

export function Badge({ tone, dot, children }) {
  return (
    <span className={`badge${tone ? ` badge-${tone}` : ''}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty-state">
      {Icon && <div className="empty-icon"><Icon size={18} strokeWidth={1.75} /></div>}
      <div className="empty-title">{title}</div>
      {description && <div className="empty-desc">{description}</div>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, maxWidth }) {
  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onClose?.()}>
      <div className="modal fade-in" role="dialog" aria-modal="true" aria-label={title} style={maxWidth ? { maxWidth } : undefined}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {onClose && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  return (
    <div className="modal-overlay" onMouseDown={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal fade-in" role="alertdialog" aria-modal="true" aria-label={title} style={{ maxWidth: 400 }}>
        <div style={{ padding: '20px 20px 24px' }}>
          <h2 className="modal-title">{title}</h2>
          {description && <p className="modal-desc">{description}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? <span className="spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
];

// variant="full" shows labels; "compact" is icon-only; "cycle" is a single icon button.
export function ThemeToggle({ variant = 'full' }) {
  const { preference, setPreference, theme } = useTheme();

  if (variant === 'cycle') {
    const next = theme === 'dark' ? 'light' : 'dark';
    const Icon = theme === 'dark' ? Sun : Moon;
    return (
      <button type="button" className="icon-btn" onClick={() => setPreference(next)} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
        <Icon size={17} />
      </button>
    );
  }

  return (
    <div className={`segmented${variant === 'compact' ? ' sm' : ''}`} role="radiogroup" aria-label="Theme">
      {THEME_OPTIONS.map(o => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={preference === o.value}
          className={preference === o.value ? 'active' : ''}
          onClick={() => setPreference(o.value)}
          title={o.label}
        >
          <o.icon size={14} />
          {variant === 'full' ? o.label : <span className="visually-hidden">{o.label}</span>}
        </button>
      ))}
    </div>
  );
}

// Recharts `content` renderer that uses theme tokens instead of inline colors.
export function ChartTooltip({ active, payload, label, format = v => v }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <div className="t-label">{label}</div>}
      {payload.map(p => (
        <div className="t-row" key={`${p.dataKey}-${p.name}`}>
          <span className="swatch" style={{ background: p.payload?.color || p.color || p.fill }}/>
          <span className="t-name">{p.name}</span>
          <span className="t-val">{format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Password field with a show/hide toggle.
export function PasswordInput({ value, onChange, placeholder, show, onToggle, ...rest }) {
  return (
    <div className="input-wrap">
      <input className="input" type={show ? 'text' : 'password'} placeholder={placeholder} value={value} onChange={onChange} {...rest} />
      <button type="button" className="icon-btn trailing" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
