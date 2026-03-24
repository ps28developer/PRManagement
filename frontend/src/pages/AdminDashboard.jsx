import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const params = useParams();
  const tab = params['*'];
  const [activeTab, setActiveTab] = useState(tab || 'analytics');
  
  useEffect(() => {
    setActiveTab(tab || 'analytics');
  }, [tab]);
  const [analytics, setAnalytics] = useState(null);
  const [expandedPrId, setExpandedPrId] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    projectId: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    sortBy: 'timestamps.created',
    order: 'desc'
  });

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [newProject, setNewProject] = useState({ name: '', description: '', employees: [], leadDevelopers: [] });

  useEffect(() => {
    fetchData();
  }, [activeTab, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'projects') {
        const res = await api.get('/admin/projects');
        setProjects(res.data);
      } else if (activeTab === 'reports') {
        const [uRes, pRes, prRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/projects'),
          api.get('/admin/prs', { params: filters })
        ]);
        setUsers(uRes.data);
        setProjects(pRes.data);
        setPrs(prRes.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await api.post('/admin/users', newUser);
    setNewUser({ name: '', email: '', password: '', role: 'Employee' });
    fetchData();
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    await api.post('/admin/projects', newProject);
    setNewProject({ name: '', description: '', employees: [], leadDevelopers: [] });
    fetchData();
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('analytics')} style={{ width: 'auto' }}>Analytics</button>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('users')} style={{ width: 'auto' }}>Manage Users</button>
        <button className={`btn ${activeTab === 'projects' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('projects')} style={{ width: 'auto' }}>Manage Projects</button>
        <button className={`btn ${activeTab === 'reports' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('reports')} style={{ width: 'auto' }}>Reports</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          {activeTab === 'analytics' && analytics && (
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="card">
                <h3>PR Status Breakdown</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.keys(analytics.statusBreakdown).map(key => ({ name: key, value: analytics.statusBreakdown[key] }))}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                      >
                        {Object.keys(analytics.statusBreakdown).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444', '#6366f1'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <h3>Findings by Severity</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.keys(analytics.severityCount).map(k => ({ name: k, count: analytics.severityCount[k] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid">
              <div className="card">
                <h4>Create New User</h4>
                <form onSubmit={handleCreateUser} className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '1rem' }}>
                  <input placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
                  <input placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                  <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="Employee">Employee</option>
                    <option value="Lead Developer">Lead Developer</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Add User</button>
                </form>
              </div>
              <div className="card">
                <h4>Existing Users</h4>
                <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.5rem 0' }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid">
              <div className="card">
                <h4>Create New Project</h4>
                <form onSubmit={handleCreateProject} className="grid" style={{ marginTop: '1rem' }}>
                  <input placeholder="Project Name" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
                  <textarea placeholder="Description" style={{ background: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                    value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
                  />
                  <button type="submit" className="btn btn-primary">Create Project</button>
                </form>
              </div>
              <div className="card">
                <h4>All Projects</h4>
                {projects.length > 0 ? (
                  projects.map(p => (
                    <div key={p._id} style={{ borderBottom: '1px solid var(--border)', padding: '1rem 0' }}>
                      <strong>{p.name}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📁</div>
                    <div className="empty-title">No Projects Found</div>
                    <p className="empty-description">
                      You haven't created any projects yet. Start by adding a new project using the form on the left.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Row 1: Project, Employee, Status */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Project</label>
                    <select value={filters.projectId} onChange={e => setFilters({...filters, projectId: e.target.value})} style={{ width: '100%', margin: 0 }}>
                      <option value="">All Projects</option>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Employee</label>
                    <select value={filters.employeeId} onChange={e => setFilters({...filters, employeeId: e.target.value})} style={{ width: '100%', margin: 0 }}>
                      <option value="">All Employees</option>
                      {users.filter(u => u.role === 'Employee').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</label>
                    <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={{ width: '100%', margin: 0 }}>
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Row 2: Dates */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Start Date</label>
                    <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} style={{ width: '100%', margin: 0 }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>End Date</label>
                    <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} style={{ width: '100%', margin: 0 }} />
                  </div>
                </div>
              </div>

              <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <th style={{ padding: '1rem 0.5rem', cursor: 'pointer' }} onClick={() => setFilters({...filters, sortBy: 'employee.name', order: filters.order === 'asc' ? 'desc' : 'asc'})}>
                        Employee {filters.sortBy === 'employee.name' && (filters.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ cursor: 'pointer' }} onClick={() => setFilters({...filters, sortBy: 'project.name', order: filters.order === 'asc' ? 'desc' : 'asc'})}>
                        Project {filters.sortBy === 'project.name' && (filters.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>PR Details</th>
                      <th>Peer Reviewer</th>
                      <th>Lead Developer</th>
                      <th style={{ minWidth: '120px' }}>Work Dates</th>
                      <th style={{ cursor: 'pointer' }} onClick={() => setFilters({...filters, sortBy: 'rejectionCount', order: filters.order === 'asc' ? 'desc' : 'asc'})}>
                        Rejections {filters.sortBy === 'rejectionCount' && (filters.order === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let lastProject = null;
                      return prs.map(pr => {
                        const showHeader = pr.project?.name !== lastProject;
                        lastProject = pr.project?.name;
                        return (
                          <React.Fragment key={pr._id}>
                            {showHeader && (
                              <tr style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                                <td colSpan="8" style={{ padding: '0.75rem 0.5rem', fontWeight: '800', fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                   {pr.project?.name || 'No Project'}
                                </td>
                              </tr>
                            )}
                            <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>
                              <td style={{ padding: '1rem 0.5rem' }}>
                                <div style={{ fontWeight: '600' }}>{pr.employee?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pr.employee?.email}</div>
                              </td>
                              <td>{pr.project?.name}</td>
                                <td>
                                  <div style={{ fontWeight: '600' }}>{pr.title}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pr.taskName} | {pr.moduleName}</div>
                                  <a href={pr.prLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'underline' }}>View GitHub PR</a>
                                </td>
                                <td>{pr.peerReviewer?.name || 'N/A'}</td>
                                <td>{pr.leadDeveloper?.name || 'N/A'}</td>
                                <td style={{ fontSize: '0.8rem' }}>
                                  <div style={{ color: 'var(--success)' }}>Start: {pr.startDate ? new Date(pr.startDate).toLocaleDateString() : 'N/A'}</div>
                                  <div style={{ color: 'var(--danger)' }}>End: {pr.endDate ? new Date(pr.endDate).toLocaleDateString() : 'N/A'}</div>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                  <span 
                                    onClick={() => setExpandedPrId(expandedPrId === pr._id ? null : pr._id)}
                                    style={{ 
                                      cursor: 'pointer',
                                      background: pr.rejectionCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '0.25rem',
                                      color: pr.rejectionCount > 0 ? '#ef4444' : 'var(--text-muted)',
                                      fontSize: '0.75rem',
                                      fontWeight: '700',
                                      display: 'inline-flex',
                                      flexDirection: 'column',
                                      alignItems: 'center'
                                    }}>
                                    {pr.rejectionCount || 0}
                                    {pr.rejectionCount > 0 && <span style={{ fontSize: '0.6rem', textDecoration: 'underline', marginTop: '2px' }}>{expandedPrId === pr._id ? 'Hide' : 'View'}</span>}
                                  </span>
                                </td>
                              <td>
                                <span style={{ 
                                  padding: '0.25rem 0.75rem', 
                                  borderRadius: '1rem', 
                                  fontSize: '0.7rem',
                                  fontWeight: '600',
                                  background: pr.status === 'Approved' ? 'var(--success)' : pr.status === 'Rejected' ? 'var(--danger)' : 'var(--warning)',
                                  color: 'white'
                                }}>{pr.status}</span>
                              </td>
                            </tr>
                            {expandedPrId === pr._id && pr.findings && pr.findings.length > 0 && (
                                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                  <td colSpan="8" style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                      {pr.findings.map((f, i) => (
                                        <div key={i} style={{ 
                                          background: 'var(--card-bg)', 
                                          padding: '1rem', 
                                          borderRadius: '0.5rem', 
                                          border: '1px solid var(--border)',
                                          borderLeft: `4px solid ${f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f97316' : '#facc15'}`
                                        }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f97316' : '#facc15' }}>{f.severity.toUpperCase()}</span>
                                            <span style={{ fontSize: '0.65rem', color: f.status === 'Fixed' ? 'var(--success)' : 'var(--warning)', fontWeight: '700' }}>{f.status || 'OPEN'}</span>
                                          </div>
                                          <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{f.description}</p>
                                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem' }}>
                                            By <b>{f.reviewer?.name}</b> ({f.reviewer?.role})
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </tbody>
                </table>
                {prs.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No PRs found matching criteria.</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
