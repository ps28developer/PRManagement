import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [assignedCount, setAssignedCount] = React.useState(0);
  const location = useLocation();

  React.useEffect(() => {
    if (user && (user.role === 'Employee' || user.role === 'Lead Developer')) {
      fetchAssignedCount();
    }
  }, [user, location.pathname]); // Refresh on navigation to keep it updated

  const fetchAssignedCount = async () => {
    try {
      const res = await api.get('/workflow/assigned-prs');
      setAssignedCount(res.data.length);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  return (
    <div style={{ display: 'flex' }}>
      <div className="sidebar">
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ color: 'var(--primary)' }}>PR ReviewApp</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.role}</p>
        </div>
        <nav style={{ padding: '1rem' }}>
          {user.role === 'Admin' && (
            <>
              <Link to="/admin/analytics" className={`nav-link ${location.pathname === '/admin/analytics' || location.pathname === '/admin' ? 'active' : ''}`}>Dashboard</Link>
              <Link to="/admin/projects" className={`nav-link ${location.pathname === '/admin/projects' ? 'active' : ''}`}>Projects</Link>
              <Link to="/admin/users" className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}>Users</Link>
            </>
          )}
          {user.role === 'Employee' && (
            <>
              <Link to="/employee" className={`nav-link ${location.pathname === '/employee' ? 'active' : ''}`}>My PRs</Link>
              <Link to="/employee/submit" className={`nav-link ${location.pathname === '/employee/submit' ? 'active' : ''}`}>Raise PR</Link>
            </>
          )}
          {(user.role === 'Employee' || user.role === 'Lead Developer') && assignedCount > 0 && (
            <Link to="/review" className={`nav-link ${location.pathname === '/review' ? 'active' : ''}`}>
              Review PRs {assignedCount > 0 && <span className="badge-small">{assignedCount}</span>}
            </Link>
          )}
        </nav>
        <div style={{ position: 'absolute', bottom: '1rem', width: '100%', padding: '0 1rem' }}>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
            Logout
          </button>
        </div>
      </div>
      <div className="main-content" style={{ flex: 1 }}>
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Welcome, {user.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {user.name[0]}
            </div>
          </div>
        </header>
        {children}
      </div>
      <style>{`
        .nav-link {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          background: #334155;
          color: white;
        }
        .nav-link.active {
          border-left: 4px solid var(--primary);
        }
      `}</style>
    </div>
  );
};

export default Layout;
