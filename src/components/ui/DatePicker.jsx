import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toISODate, toISOMonth } from '../../utils/constants.js';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS     = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const parseDate  = v => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? new Date(`${v}T00:00:00`) : null);
const parseMonth = v => (/^\d{4}-\d{2}$/.test(v || '') ? new Date(`${v}-01T00:00:00`) : null);
const sameDay    = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addDays    = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths  = (d, n) => {
  // Clamp the day so Jan 31 + 1 month lands on Feb 28/29, not Mar 3.
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate();
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last));
};

// Popover anchored to a trigger, rendered in a portal so modals and cards with
// overflow don't clip it. Flips above the trigger when there's no room below.
function usePopover() {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState(null);
  const triggerRef = useRef(null);
  const popRef     = useRef(null);

  const place = useCallback(() => {
    const t = triggerRef.current, p = popRef.current;
    if (!t || !p) return;
    const r = t.getBoundingClientRect();
    const { offsetWidth: pw, offsetHeight: ph } = p;
    const vw = window.innerWidth, vh = window.innerHeight, gap = 6, edge = 8;
    const left = Math.max(edge, Math.min(r.left, vw - pw - edge));
    let top = r.bottom + gap;
    if (top + ph > vh - edge && r.top - ph - gap > edge) top = r.top - ph - gap;
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => { if (open) place(); else setPos(null); }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = e => {
      if (!popRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  return { open, setOpen, close, pos, triggerRef, popRef };
}

function Trigger({ pop, id, label, text, placeholder, clearable, onClear, className, style, ariaLabel }) {
  return (
    <div className={`picker${className ? ` ${className}` : ''}`} style={style}>
      <button
        ref={pop.triggerRef}
        id={id}
        type="button"
        className="input picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={pop.open}
        aria-label={ariaLabel ? `${ariaLabel}${text ? `: ${text}` : ''}` : undefined}
        onClick={() => pop.setOpen(o => !o)}
        style={clearable && text ? { paddingRight: 34 } : undefined}
      >
        <Calendar size={15} className="picker-icon" aria-hidden="true"/>
        <span className={text ? 'picker-value' : 'picker-placeholder'}>{text || placeholder}</span>
      </button>
      {clearable && text && (
        <button type="button" className="icon-btn picker-clear" onClick={onClear} aria-label={`Clear ${label || 'value'}`}>
          <X size={14}/>
        </button>
      )}
    </div>
  );
}

function Popover({ pop, label, children }) {
  if (!pop.open) return null;
  return createPortal(
    <div
      ref={pop.popRef}
      className="popover picker-pop"
      role="dialog"
      aria-label={label}
      style={pop.pos ? { top: pop.pos.top, left: pop.pos.left } : { top: 0, left: 0, visibility: 'hidden' }}
    >
      {children}
    </div>,
    document.body
  );
}

/* ── Date picker ─────────────────────────────────────────── */
export function DatePicker({ value, onChange, placeholder = 'Select date', clearable = false, id, className, style, 'aria-label': ariaLabel }) {
  const pop      = usePopover();
  const selected = parseDate(value);
  const today    = new Date();
  const [focus, setFocus] = useState(selected || today);
  const gridRef  = useRef(null);

  // Reset the view to the selected date (or today) every time it opens.
  useEffect(() => { if (pop.open) setFocus(parseDate(value) || new Date()); }, [pop.open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep DOM focus on the roving cell.
  useEffect(() => {
    if (pop.open && pop.pos) gridRef.current?.querySelector('[tabindex="0"]')?.focus();
  }, [pop.open, pop.pos, focus]);

  const pick = d => { onChange(toISODate(d)); pop.close(); };

  const onGridKey = e => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step) { e.preventDefault(); setFocus(f => addDays(f, step)); return; }
    if (e.key === 'PageUp')   { e.preventDefault(); setFocus(f => addMonths(f, e.shiftKey ? -12 : -1)); }
    if (e.key === 'PageDown') { e.preventDefault(); setFocus(f => addMonths(f, e.shiftKey ? 12 : 1)); }
    if (e.key === 'Home')     { e.preventDefault(); setFocus(f => addDays(f, -f.getDay())); }
    if (e.key === 'End')      { e.preventDefault(); setFocus(f => addDays(f, 6 - f.getDay())); }
  };

  // Six-week grid starting on the Sunday on/before the 1st.
  const first = new Date(focus.getFullYear(), focus.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  const days  = Array.from({ length: 42 }, (_, i) => addDays(start, i));

  const text = selected
    ? selected.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <>
      <Trigger pop={pop} id={id} label="date" text={text} placeholder={placeholder} clearable={clearable}
        onClear={() => onChange('')} className={className} style={style} ariaLabel={ariaLabel}/>
      <Popover pop={pop} label="Choose date">
        <div className="picker-head">
          <button type="button" className="icon-btn" onClick={() => setFocus(f => addMonths(f, -1))} aria-label="Previous month"><ChevronLeft size={16}/></button>
          <div className="picker-title" aria-live="polite">
            {focus.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </div>
          <button type="button" className="icon-btn" onClick={() => setFocus(f => addMonths(f, 1))} aria-label="Next month"><ChevronRight size={16}/></button>
        </div>

        <div className="cal-grid" role="grid" ref={gridRef} onKeyDown={onGridKey}>
          {WEEKDAYS.map(w => <div key={w} className="cal-weekday" role="columnheader">{w}</div>)}
          {days.map(d => {
            const outside = d.getMonth() !== focus.getMonth();
            const isSel   = sameDay(d, selected);
            const isToday = sameDay(d, today);
            return (
              <button
                key={d.toISOString()}
                type="button"
                role="gridcell"
                tabIndex={sameDay(d, focus) ? 0 : -1}
                aria-selected={isSel}
                aria-current={isToday ? 'date' : undefined}
                aria-label={d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                className={`cal-day${outside ? ' outside' : ''}${isSel ? ' selected' : ''}${isToday ? ' today' : ''}`}
                onClick={() => pick(d)}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="picker-foot">
          {clearable
            ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onChange(''); pop.close(); }}>Clear</button>
            : <span/>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => pick(new Date())}>Today</button>
        </div>
      </Popover>
    </>
  );
}

/* ── Month picker ────────────────────────────────────────── */
export function MonthPicker({ value, onChange, placeholder = 'Select month', clearable = false, id, className, style, 'aria-label': ariaLabel }) {
  const pop      = usePopover();
  const selected = parseMonth(value);
  const now      = new Date();
  const [year, setYear]   = useState((selected || now).getFullYear());
  const [focus, setFocus] = useState((selected || now).getMonth());
  const gridRef  = useRef(null);

  useEffect(() => {
    if (!pop.open) return;
    const base = parseMonth(value) || new Date();
    setYear(base.getFullYear());
    setFocus(base.getMonth());
  }, [pop.open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pop.open && pop.pos) gridRef.current?.querySelector('[tabindex="0"]')?.focus();
  }, [pop.open, pop.pos, focus, year]);

  const pick = (y, m) => { onChange(toISOMonth(new Date(y, m, 1))); pop.close(); };

  const move = step => {
    const n = focus + step;
    if (n < 0)  { setYear(y => y - 1); setFocus(n + 12); }
    else if (n > 11) { setYear(y => y + 1); setFocus(n - 12); }
    else setFocus(n);
  };
  const onGridKey = e => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[e.key];
    if (step) { e.preventDefault(); move(step); }
    if (e.key === 'PageUp')   { e.preventDefault(); setYear(y => y - 1); }
    if (e.key === 'PageDown') { e.preventDefault(); setYear(y => y + 1); }
  };

  const text = selected ? selected.toLocaleDateString('en', { month: 'long', year: 'numeric' }) : '';

  return (
    <>
      <Trigger pop={pop} id={id} label="month" text={text} placeholder={placeholder} clearable={clearable}
        onClear={() => onChange('')} className={className} style={style} ariaLabel={ariaLabel}/>
      <Popover pop={pop} label="Choose month">
        <div className="picker-head">
          <button type="button" className="icon-btn" onClick={() => setYear(y => y - 1)} aria-label="Previous year"><ChevronLeft size={16}/></button>
          <div className="picker-title" aria-live="polite">{year}</div>
          <button type="button" className="icon-btn" onClick={() => setYear(y => y + 1)} aria-label="Next year"><ChevronRight size={16}/></button>
        </div>

        <div className="month-grid" role="grid" ref={gridRef} onKeyDown={onGridKey}>
          {MONTHS_SHORT.map((m, i) => {
            const isSel     = selected && selected.getFullYear() === year && selected.getMonth() === i;
            const isCurrent = now.getFullYear() === year && now.getMonth() === i;
            return (
              <button
                key={m}
                type="button"
                role="gridcell"
                tabIndex={i === focus ? 0 : -1}
                aria-selected={!!isSel}
                aria-current={isCurrent ? 'date' : undefined}
                aria-label={new Date(year, i, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                className={`cal-month${isSel ? ' selected' : ''}${isCurrent ? ' today' : ''}`}
                onClick={() => pick(year, i)}
              >
                {m}
              </button>
            );
          })}
        </div>

        <div className="picker-foot">
          {clearable
            ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { onChange(''); pop.close(); }}>{placeholder}</button>
            : <span/>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => pick(now.getFullYear(), now.getMonth())}>This month</button>
        </div>
      </Popover>
    </>
  );
}
