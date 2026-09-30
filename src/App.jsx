import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, MessageSquareText,
  MessageCircle, Settings as SettingsIcon, ShieldCheck, LogOut, RotateCw,
} from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { Logo, ThemeToggle, Badge } from './components/ui/index.jsx';

// Public pages
import Landing      from './pages/Landing.jsx';
import Login        from './pages/Login.jsx';
import Register     from './pages/Register.jsx';
import VerifyEmail  from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword  from './pages/ResetPassword.jsx';
import About        from './pages/About.jsx';
import Contact      from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import Terms        from './pages/Terms.jsx';
import Features     from './pages/Features.jsx';

// App pages (require auth)
import Dashboard    from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Budgets      from './pages/Budgets.jsx';
import AIAdvisor    from './pages/AIAdvisor.jsx';
import Reports      from './pages/Reports.jsx';
import Feedback     from './pages/Feedback.jsx';
import Settings     from './pages/Settings.jsx';
import Onboarding   from './pages/Onboarding.jsx';
import Admin        from './pages/Admin.jsx';

// ── Nav items ─────────────────────────────────────────
const NAV = [
  { to:'/dashboard',    icon:LayoutDashboard,   label:'Dashboard',    short:'Home'     },
  { to:'/transactions', icon:ArrowLeftRight,    label:'Transactions', short:'Activity' },
  { to:'/budgets',      icon:PiggyBank,         label:'Budgets',      short:'Budgets'  },
  { to:'/reports',      icon:BarChart3,         label:'Reports',      short:'Reports'  },
  { to:'/ai',           icon:MessageSquareText, label:'Advisor',      short:'Advisor'  },
  { to:'/feedback',     icon:MessageCircle,     label:'Feedback',     short:'Feedback' },
  { to:'/settings',     icon:SettingsIcon,      label:'Settings',     short:'Settings' },
];

// ── Guards ────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" style={{ width:24, height:24 }}/>
    </div>
  );
  if (!user) return <Navigate to="/login" replace/>;
  if (user && !user.onboardingCompleted) return <Navigate to="/onboarding" replace/>;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace/> : children;
}

function NavItem({ to, icon: Icon, label, short }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
      <Icon size={17} strokeWidth={1.75}/>
      <span className="nav-label">{label}</span>
      <span className="nav-short">{short}</span>
    </NavLink>
  );
}

// ── App Layout ────────────────────────────────────────
function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate('/');
  };
  const refreshKeysByPath = {
    '/dashboard': [['dashboard'], ['ai-insights']],
    '/transactions': [['expenses']],
    '/budgets': [['budgets']],
    '/reports': [['reports']],
    '/feedback': [['feedback']],
  };
  const refreshKeys = refreshKeysByPath[location.pathname] || [];
  const isRefreshing = useIsFetching();
  const refreshPage = async () => {
    const toastId = toast.loading('Refreshing…');
    try {
      await Promise.all(refreshKeys.map(queryKey => queryClient.invalidateQueries({ queryKey })));
      toast.success('Up to date', { id: toastId });
    } catch {
      toast.error('Refresh failed', { id: toastId });
    }
  };
  const initial = user?.name?.[0]?.toUpperCase() || 'U';
  const refreshButton = refreshKeys.length > 0 && (
    <button
      className="icon-btn refresh-btn"
      type="button"
      onClick={refreshPage}
      disabled={isRefreshing > 0}
      title="Refresh data"
      aria-label="Refresh data"
    >
      <RotateCw size={16}/>
    </button>
  );

  return (
    <div className="app-layout">
      {/* Mobile top header */}
      <header className="mobile-header">
        <Logo/>
        <div className="right">
          {user?.unlimitedAI && <Badge tone="accent">Pro</Badge>}
          {refreshButton}
          <ThemeToggle variant="cycle"/>
          <span className="avatar" title={user?.name}>{initial}</span>
        </div>
      </header>

      <aside className="sidebar">
        <div className="sidebar-logo"><Logo/></div>

        {NAV.map(n => <NavItem key={n.to} {...n}/>)}

        {user?.isAdmin && (
          <>
            <div className="sidebar-section">Admin</div>
            <NavItem to="/admin" icon={ShieldCheck} label="Users & access" short="Admin"/>
          </>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar">{initial}</span>
            <div className="who">
              <div className="name">
                <span>{user?.name}</span>
                {user?.unlimitedAI && <Badge tone="accent">Pro</Badge>}
              </div>
              <div className="email">{user?.email}</div>
            </div>
          </div>
          <div className="sidebar-actions">
            <ThemeToggle variant="compact"/>
            <div style={{ display:'flex', gap:2 }}>
              {refreshButton}
              <button onClick={handleLogout} className="icon-btn" title="Log out" aria-label="Log out">
                <LogOut size={16}/>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ── Shared page wrapper for public info pages ─────────
function PublicLayout({ children }) {
  const { user } = useAuth();
  return (
    <div style={{ minHeight:'100vh' }}>
      <nav className="public-nav">
        <Logo/>
        <div className="public-nav-actions">
          <ThemeToggle variant="cycle"/>
          {user ? (
            <NavLink to="/dashboard" className="btn btn-primary btn-sm">Open app</NavLink>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm">Log in</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">Get started</NavLink>
            </>
          )}
        </div>
      </nav>
      <div style={{ padding:'0 20px' }}>{children}</div>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public landing */}
      <Route path="/"          element={<Landing />} />

      {/* Auth */}
      <Route path="/login"     element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register"  element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/verify-email"        element={<VerifyEmail />} />
      <Route path="/forgot-password"     element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* App pages */}
      <Route path="/dashboard"    element={<PrivateRoute><Layout><Dashboard    /></Layout></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
      <Route path="/budgets"      element={<PrivateRoute><Layout><Budgets      /></Layout></PrivateRoute>} />
      <Route path="/ai"           element={<PrivateRoute><Layout><AIAdvisor    /></Layout></PrivateRoute>} />
      <Route path="/reports"      element={<PrivateRoute><Layout><Reports      /></Layout></PrivateRoute>} />
      <Route path="/feedback"     element={<PrivateRoute><Layout><Feedback     /></Layout></PrivateRoute>} />
      <Route path="/settings"     element={<PrivateRoute><Layout><Settings     /></Layout></PrivateRoute>} />
      <Route path="/admin"        element={<PrivateRoute><Layout>{user && user.isAdmin ? <Admin /> : <Navigate to="/dashboard" replace />}</Layout></PrivateRoute>} />

      {/* Public info pages */}
      <Route path="/about"          element={<PublicLayout><About          /></PublicLayout>} />
      <Route path="/contact"        element={<PublicLayout><Contact        /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy  /></PublicLayout>} />
      <Route path="/terms"          element={<PublicLayout><Terms          /></PublicLayout>} />

      {/* Unlisted feature guide: reachable by URL only, intentionally not linked anywhere */}
      <Route path="/features"       element={<PublicLayout><Features       /></PublicLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
