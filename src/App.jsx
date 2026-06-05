import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';

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

// App pages (require auth)
import Dashboard    from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Budgets      from './pages/Budgets.jsx';
import AIAdvisor    from './pages/AIAdvisor.jsx';
import Reports      from './pages/Reports.jsx';
import Feedback     from './pages/Feedback.jsx';
import Settings     from './pages/Settings.jsx';
import Onboarding   from './pages/Onboarding.jsx';

// ── Nav items ─────────────────────────────────────────
const NAV = [
  { to:'/dashboard',    icon:'◈', label:'Dashboard'    },
  { to:'/transactions', icon:'≡', label:'Transactions' },
  { to:'/budgets',      icon:'◎', label:'Budgets'      },
  { to:'/reports',      icon:'📊', label:'Reports'     },
  { to:'/ai',           icon:'✦', label:'AI Advisor', badge:'AI' },
  { to:'/feedback',     icon:'💬', label:'Feedback'    },
  { to:'/settings',     icon:'⚙', label:'Settings'     },
];

// ── Guards ────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080C14' }}>
      <div className="spinner" style={{ width:36, height:36 }}/>
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
  const navIcon = (item) => {
    if (item.label === 'Reports') return '\u25A5';
    if (item.label === 'Feedback') return '\u2709\uFE0E';
    return item.icon;
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
    const toastId = toast.loading('Refreshing...');
    try {
      await Promise.all(refreshKeys.map(queryKey => queryClient.invalidateQueries({ queryKey })));
      toast.success('Data refreshed', { id: toastId });
    } catch {
      toast.error('Refresh failed', { id: toastId });
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* Logo - hidden on mobile */}
        <div style={{ marginBottom:24, paddingLeft:4 }}>
          <div style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:700, color:'var(--gold)', letterSpacing:1 }} className="logo-text">✦ Aurum</div>
          <div style={{ fontSize:9, fontFamily:'var(--font-mono)', color:'#3A4A5E', letterSpacing:2, marginTop:2 }} className="logo-text">EXPENSE TRACKER</div>
        </div>

        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span style={{ fontSize:15, flexShrink:0 }}>{navIcon(n)}</span>
            <span className="nav-label">{n.label}</span>
            {n.badge && <span className="nav-label" style={{ marginLeft:'auto', background:'#C9A84C22', color:'var(--gold)', fontSize:9, padding:'2px 6px', borderRadius:8 }}>{n.badge}</span>}
          </NavLink>
        ))}

        {/* Logout - hidden on mobile (in settings instead) */}
        <div style={{ marginTop:'auto', paddingTop:16, borderTop:'1px solid var(--border)' }}>
          <div style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text-dim)', marginBottom:8, paddingLeft:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} className="nav-label">
            {user?.name}
          </div>
          <button onClick={handleLogout} className="ghost-btn" style={{ width:'100%', padding:'8px' }}>
            <span style={{ marginRight:6 }}>⇥</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <main className={`main-content${refreshKeys.length > 0 ? ' has-page-refresh' : ''}`}>
        {refreshKeys.length > 0 && (
          <button
            className="page-refresh-btn"
            type="button"
            onClick={refreshPage}
            disabled={isRefreshing > 0}
            title="Refresh this page"
            aria-label="Refresh this page"
          >
            <span>{'\u21bb'}</span>
          </button>
        )}
        {children}
      </main>
    </div>
  );
}

// ── Shared page wrapper for public info pages ─────────
function PublicLayout({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>
      <nav style={{ position:'sticky', top:0, zIndex:50, background:'#080C1499', backdropFilter:'blur(16px)', borderBottom:'1px solid var(--border)', padding:'14px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <NavLink to="/" style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:700, color:'var(--gold)', letterSpacing:1, textDecoration:'none' }}>✦ Aurum</NavLink>
        <div style={{ display:'flex', gap:16 }}>
          <NavLink to="/login"    style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:13, fontFamily:'var(--font-mono)' }}>Login</NavLink>
          <NavLink to="/register" style={{ background:'var(--gold-dim)', border:'1px solid #C9A84C44', color:'var(--gold)', textDecoration:'none', fontSize:12, fontFamily:'var(--font-mono)', padding:'6px 16px', borderRadius:8 }}>Register</NavLink>
        </div>
      </nav>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px 60px' }}>{children}</div>
    </div>
  );
}

export default function App() {
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

      {/* Public info pages */}
      <Route path="/about"          element={<PublicLayout><About          /></PublicLayout>} />
      <Route path="/contact"        element={<PublicLayout><Contact        /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy  /></PublicLayout>} />
      <Route path="/terms"          element={<PublicLayout><Terms          /></PublicLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
