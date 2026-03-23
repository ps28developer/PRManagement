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
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [newProject, setNewProject] = useState({ name: '', description: '', employees: [], leadDevelopers: [] });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

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
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
