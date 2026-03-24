import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const params = useParams();
  const action = params['*'];
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [prs, setPrs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showSubmit, setShowSubmit] = useState(action === 'submit');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    setShowSubmit(action === 'submit');
  }, [action]);
  const [formData, setFormData] = useState({
    title: '',
    prLink: '',
    moduleName: '',
    taskName: '',
    project: '',
    peerReviewer: '',
    leadDeveloper: ''
  });

  useEffect(() => {
    fetchPrs();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchPrs = async () => {
    const res = await api.get('/workflow/my-prs');
    setPrs(res.data);
  };

  const fetchProjects = async () => {
    const res = await api.get('/admin/projects');
    setProjects(res.data);
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workflow/submit', formData);
      navigate('/employee');
      fetchPrs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {showSubmit ? (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4>Raise New Pull Request</h4>
            <button onClick={() => navigate('/employee')} className="btn" style={{ width: 'auto', background: '#334155' }}>Cancel</button>
          </div>
          {projects.length > 0 ? (
            <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.5rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>PR Link (GitHub/GitLab)</label>
                <input 
                  placeholder="https://github.com/org/repo/pull/123" 
                  value={formData.prLink} 
                  onChange={e => setFormData({...formData, prLink: e.target.value})} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Task Number / ID</label>
                <input 
                  placeholder="e.g. TASK-101" 
                  value={formData.taskName} 
                  onChange={e => setFormData({...formData, taskName: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Module Name</label>
                <input 
                  placeholder="e.g. Auth Component" 
                  value={formData.moduleName} 
                  onChange={e => setFormData({...formData, moduleName: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Project</label>
                <select 
                  style={{ width: '100%', background: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                  onChange={e => setFormData({...formData, project: e.target.value})} value={formData.project} required
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Peer Reviewer</label>
                <select 
                  style={{ width: '100%', background: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                  onChange={e => setFormData({...formData, peerReviewer: e.target.value})} value={formData.peerReviewer} required
                >
                  <option value="">Choose a Peer...</option>
                  {users.filter(u => u.role === 'Employee' && u._id !== currentUser?._id).map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Lead Developer</label>
                <select 
                  style={{ width: '100%', background: '#0f172a', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                  onChange={e => setFormData({...formData, leadDeveloper: e.target.value})} value={formData.leadDeveloper} required
                >
                  <option value="">Choose a Lead...</option>
                  {users.filter(u => u.role === 'Lead Developer').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Submit for Review</button>
              </div>
            </form>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon"></div>
              <div className="empty-title">No Projects Available</div>
              <p className="empty-description">
                There are no projects assigned to you yet. Please contact your system administrator.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>My Pull Requests</h3>
            <button onClick={() => navigate('/employee/submit')} className="btn btn-primary" style={{ width: 'auto' }}>
              Raise PR
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => setActiveTab('pending')} 
              className="btn"
              style={{ 
                background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
                border: '1px solid var(--primary)',
                color: activeTab === 'pending' ? 'white' : 'var(--text-muted)',
                flex: 1
              }}
            >
              Pending PRs
            </button>
            <button 
              onClick={() => setActiveTab('approved')} 
              className="btn"
              style={{ 
                background: activeTab === 'approved' ? 'var(--primary)' : 'transparent',
                border: '1px solid var(--primary)',
                color: activeTab === 'approved' ? 'white' : 'var(--text-muted)',
                flex: 1
              }}
            >
              Approved PRs
            </button>
          </div>

          <div className="grid">
            {prs.filter(pr => activeTab === 'pending' ? !['Approved', 'Merged', 'Rejected'].includes(pr.status) : pr.status === 'Approved').length > 0 ? (
              prs.filter(pr => activeTab === 'pending' ? !['Approved', 'Merged', 'Rejected'].includes(pr.status) : pr.status === 'Approved').map(pr => (
                <div key={pr._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary)' }}>{pr.title || pr.taskName}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pr.moduleName} | {pr.taskName}</p>
                    </div>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      background: pr.status === 'Approved' ? 'var(--success)' : 
                                 (pr.status === 'Peer Approved' || pr.status === 'Lead Approved') ? '#3b82f6' : 
                                 pr.status === 'Needs Fix' ? 'var(--danger)' : 'var(--warning)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '80px',
                      height: 'fit-content',
                      textAlign: 'center'
                    }}>
                      {pr.status === 'Peer Approved' ? 'Lead Review Pending' : 
                       pr.status === 'Lead Approved' ? 'Peer Review Pending' : 
                       pr.status}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span><b>Start:</b> {pr.startDate ? new Date(pr.startDate).toLocaleDateString() : 'N/A'}</span>
                    <span><b>End:</b> {pr.endDate ? new Date(pr.endDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  
                  {pr.findings && pr.findings.length > 0 && (
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: 'var(--primary)', width: '4px', height: '14px', borderRadius: '2px' }}></span>
                        Reviewer Feedback
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pr.findings.map((f, i) => (
                          <div key={i} style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '0.75rem', 
                            borderRadius: '0.5rem', 
                            borderLeft: `4px solid ${f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f97316' : '#facc15'}`,
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                              <span style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '800', 
                                textTransform: 'uppercase', 
                                padding: '0.1rem 0.4rem', 
                                borderRadius: '0.25rem',
                                background: f.severity === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : f.severity === 'High' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                color: f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f97316' : '#facc15',
                                letterSpacing: '0.05em'
                              }}>{f.severity}</span>
                              <span style={{ 
                                fontSize: '0.65rem', 
                                fontWeight: '800', 
                                textTransform: 'uppercase', 
                                padding: '0.1rem 0.4rem', 
                                borderRadius: '0.25rem',
                                background: f.status === 'Fixed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: f.status === 'Fixed' ? 'var(--success)' : 'var(--warning)',
                                letterSpacing: '0.05em'
                              }}>{f.status || 'Open'}</span>
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                              By <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{f.reviewer?.name}</span> ({f.reviewer?.role})
                            </p>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4', margin: 0 }}>{f.description}</p>
                          </div>
                        ))}
                      </div>
                      {pr.status === 'Needs Fix' && (
                         <button 
                         onClick={() => api.patch(`/workflow/update/${pr._id}`).then(fetchPrs)}
                         className="btn btn-primary" style={{ marginTop: '1.25rem', padding: '0.75rem', width: '100%' }}>
                           Changes Fixed - Resubmit
                         </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: 'span 2' }}>
                <div className="empty-icon">{activeTab === 'pending' ? '📝' : '✅'}</div>
                <div className="empty-title">No {activeTab} PRs Found</div>
                <p className="empty-description">
                  {activeTab === 'pending' 
                    ? "You haven't submitted any pull requests yet. Click \"Raise PR\" to get started."
                    : "You don't have any approved pull requests yet. Good luck with your current reviews!"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
