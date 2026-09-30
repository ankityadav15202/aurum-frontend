import { useEffect } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, MessageSquareText, MessageCircle,
  Settings as SettingsIcon, Rocket, UserRound, Palette, Smartphone, ShieldCheck, Tags,
} from 'lucide-react';
import { CATS, CURRENCIES } from '../utils/constants.js';

// Public feature guide at /features, linked from the site footer, the app
// sidebar, Settings and onboarding. Keep it user-facing: no endpoints or
// internals. Update it when a feature's behavior or limits change.

const SECTIONS = [
  {
    id: 'getting-started',
    icon: Rocket,
    title: 'Getting started',
    summary: 'Create an account, confirm your email, and answer a few setup questions.',
    points: [
      'Sign up with your name, email and a password of at least 6 characters.',
      'Aurum emails you a verification link, valid for 24 hours. You need to open it before you can log in. If it expires, you can request a new one from the verification page.',
      'After your first login a short five-step setup asks for your currency, your monthly income, one budget and one recent expense.',
      'Your monthly income is saved as an income transaction dated the 1st of the current month, so your savings figures are correct from day one.',
      'You can skip setup at any time and do everything later from the app.',
    ],
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    summary: 'A one-page summary of the current month.',
    points: [
      'Four headline numbers: spent this month, income, net savings (income minus spending) and number of transactions.',
      'Daily spending for the last 7 days, with the week’s total. Hover a point to see that day’s amount.',
      'Spending by category as a ring chart, with your top six categories and their totals listed beside it.',
      'Progress on each budget you’ve set. Bars turn amber at 80% of the limit and red once you reach it.',
      'Insights: short notes generated from this month’s activity, such as a category close to its limit, an unusually high expense, or a strong savings rate.',
      'Your six most recent transactions, with links through to the full list and your budgets.',
    ],
  },
  {
    id: 'transactions',
    icon: ArrowLeftRight,
    title: 'Transactions',
    summary: 'Record, find and correct every expense and income entry.',
    points: [
      'Add a transaction with a description, amount, date, category and an optional note.',
      '“Suggest category” reads your description and picks the most likely category for you. You can always change it.',
      'Mark an entry as repeating (daily, weekly, monthly or yearly) for things like rent, subscriptions or salary. Repeating entries show a repeat marker in the list.',
      'Search by description, filter by category or month, and sort by newest or largest amount.',
      'The totals above the list (spent, income, balance) reflect the transactions currently shown.',
      'Edit or delete any entry with the pencil and bin buttons on each row. Deleting asks for confirmation and can’t be undone.',
      'Lists show 20 transactions per page.',
    ],
  },
  {
    id: 'budgets',
    icon: PiggyBank,
    title: 'Budgets',
    summary: 'Monthly spending limits for each category.',
    points: [
      'Set a monthly limit for any expense category. Categories without a limit still show what you’ve spent in them.',
      'Each category shows one of four statuses: No budget, On track, Near limit (80% or more) or Over budget.',
      'A chart compares each budget with what you’ve actually spent, highlighting any category that has gone over.',
      'The summary shows your total budget, total spent this month, what remains, and how many categories have a limit.',
      'Press Enter to save a limit or Escape to cancel. Remove a limit at any time.',
    ],
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Reports',
    summary: 'A written summary of any month, which you can export.',
    points: [
      'Pick a month and generate a report. Past reports stay in the history list for quick access.',
      'Each report shows income, expenses, net savings, your savings rate and the number of transactions.',
      'A chart breaks the month’s spending down by category.',
      'A short written summary explains the month in plain language: where the money went and what changed.',
      'Export any report as a PDF or as a CSV file for a spreadsheet.',
    ],
  },
  {
    id: 'advisor',
    icon: MessageSquareText,
    title: 'Advisor',
    summary: 'Ask questions about your money in plain language.',
    points: [
      'The advisor answers using your own transactions and budgets, so replies are specific to you rather than generic tips.',
      'Starter questions cover spending patterns, where to save, budget checks, savings goals, a month-end forecast, unusual spending, top expenses and your savings rate. You can also type your own.',
      'Answers can include lists and small tables.',
      'Your conversation is kept in your browser only. Clearing it with the bin button removes it for good.',
      'Free accounts include 2 questions. Contact support if you need unlimited access.',
      'The advisor gives general guidance, not professional financial advice.',
    ],
  },
  {
    id: 'feedback',
    icon: MessageCircle,
    title: 'Feedback',
    summary: 'Tell us what to fix or build next.',
    points: [
      'Send a feature request, bug report, suggestion or general comment, with a title, details and a priority (low, medium or high).',
      'The “Your submissions” tab lists everything you’ve sent, with its current status: Open, In review or Resolved.',
    ],
  },
  {
    id: 'settings',
    icon: SettingsIcon,
    title: 'Settings',
    summary: 'Your profile, security and preferences.',
    points: [
      'Profile: change the name shown in the app. Your email address can’t be changed.',
      'Security: change your password by entering your current one and a new one of at least 6 characters.',
      'Currency: choose the symbol used for every amount. Existing amounts are not converted, only displayed with the new symbol.',
      'Appearance: choose Light, Dark, or System to follow your device.',
      'Account: sign out, or permanently delete all your transactions. Budgets are kept when transactions are deleted.',
    ],
  },
  {
    id: 'account-access',
    icon: UserRound,
    title: 'Password and account access',
    summary: 'Recover your account if you forget your password.',
    points: [
      '“Forgot password?” on the sign-in page emails you a reset link, which expires after one hour.',
      'A new password set through the reset link must have at least 8 characters, including an uppercase letter, a lowercase letter and a number.',
      'If your session expires, you’re returned to the sign-in page. Your data is unaffected.',
    ],
  },
  {
    id: 'categories',
    icon: Tags,
    title: 'Categories and currencies',
    summary: 'The building blocks every transaction uses.',
    render: () => (
      <>
        <p>Every transaction belongs to one of ten categories. Each has its own icon and a fixed chart color:</p>
        <ul className="guide-chips">
          {CATS.map(c => (
            <li key={c.id}>
              <c.icon size={14} strokeWidth={1.75}/>
              {c.label}
            </li>
          ))}
        </ul>
        <p>Supported currencies:</p>
        <ul className="guide-chips">
          {CURRENCIES.map(c => (
            <li key={c.s}><span className="num" style={{ fontWeight:600 }}>{c.s}</span>{c.l.split('–')[1]?.trim()}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'appearance',
    icon: Palette,
    title: 'Light and dark mode',
    summary: 'Comfortable in any lighting.',
    points: [
      'Aurum follows your device’s light or dark setting by default.',
      'Override it from Settings → Appearance, the theme control at the bottom of the sidebar, or the sun and moon button in the top bar.',
      'Your choice is remembered on this device. Charts switch colors with the theme.',
    ],
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile and installing the app',
    summary: 'Works on phones, and can be installed like an app.',
    points: [
      'On small screens, navigation moves to a bar at the bottom of the screen, and forms open as sheets from the bottom.',
      'Add Aurum to your home screen from your browser’s menu to open it like a regular app.',
      'If you lose your connection, Aurum shows an offline page and picks up again once you’re back online.',
    ],
  },
  {
    id: 'privacy',
    icon: ShieldCheck,
    title: 'Privacy and data',
    summary: 'What happens to your information.',
    points: [
      'Your financial data is only visible to you when you’re signed in.',
      'To answer questions, write insights and summarize reports, relevant spending data is sent to an AI service. See the Privacy Policy for details.',
      'Advisor conversations are not stored on our servers.',
      'You can delete all your transactions at any time from Settings → Account.',
    ],
  },
];

export default function Features() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Feature guide - Aurum';

    // The browser tries to jump to #section before React renders it, so do it here.
    if (window.location.hash) {
      document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
    }
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <div className="guide fade-in">
      <aside className="guide-toc" aria-label="On this page">
        <div className="guide-toc-title">On this page</div>
        <nav>
          {SECTIONS.map(s => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}
        </nav>
      </aside>

      <article className="prose-page guide-body">
        <div className="prose-eyebrow">Feature guide</div>
        <h1>Everything Aurum can do.</h1>
        <p className="lede">
          A walkthrough of each part of the app: what it’s for, how to use it, and the details worth knowing.
        </p>

        {SECTIONS.map(s => (
          <section key={s.id} id={s.id} className="guide-section">
            <div className="guide-section-head">
              <span className="cat-icon" aria-hidden="true"><s.icon size={17} strokeWidth={1.75}/></span>
              <div>
                <h2>{s.title}</h2>
                <p className="guide-summary">{s.summary}</p>
              </div>
            </div>
            {s.render ? s.render() : (
              <ul>
                {s.points.map(p => <li key={p}>{p}</li>)}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
