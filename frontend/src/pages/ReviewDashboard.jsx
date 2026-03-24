import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ReviewDashboard = () => {
  const { user } = useAuth();
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPr, setSelectedPr] = useState(null);
  const [finding, setFinding] = useState({ description: '', severity: 'Medium' });
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrs();
  }, [activeTab]);

  const fetchPrs = async () => {
    try {
      const endpoint = activeTab === 'pending' ? '/workflow/assigned-prs' : '/workflow/assigned-history';
      const res = await api.get(endpoint);
      setPrs(res.data);
      if (res.data.length === 0 && user?.role === 'Employee' && activeTab === 'pending') {
        navigate('/employee');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    try {
      const payload = {
        status,
        findings: finding.description ? [finding] : []
      };
      await api.post(`/workflow/review/${selectedPr._id}`, payload);
      setSelectedPr(null);
      setFinding({ description: '', severity: 'Medium' });
      fetchPrs();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedPr ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignSelf: 'start' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => { setActiveTab('pending'); setSelectedPr(null); }} 
            className="btn"
            style={{ 
              background: activeTab === 'pending' ? 'var(--primary)' : 'transparent',
              border: '1px solid var(--primary)',
              flex: 1
            }}
          >
            Pending Reviews
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setSelectedPr(null); }} 
            className="btn"
            style={{ 
              background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
              border: '1px solid var(--primary)',
              flex: 1
            }}
          >
            Review History
          </button>
        </div>

        {prs.map(pr => (
          <div key={pr._id} className="card" onClick={() => setSelectedPr(pr)} 
            style={{ cursor: 'pointer', border: selectedPr?._id === pr._id ? '1px solid var(--primary)' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
                <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{pr.title || pr.taskName}</h4>
                <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Submitted by: <span style={{ color: 'var(--text)' }}>{pr.employee?.name}</span></p>
                <a href={pr.prLink} target="_blank" rel="noopener noreferrer" 
                  style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'underline', display: 'block', marginBottom: '0.5rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View PR Link
                </a>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                            By <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{f.reviewer?.name}</span> ({f.reviewer?.role})
                          </p>
                          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4', margin: 0 }}>{f.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                minWidth: '80px'
              }}>
                {pr.status}
              </span>
          </div>
        ))}
        {prs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No PRs found in this section.</p>}
      </div>

      {selectedPr && (
        <div className="card" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>{activeTab === 'pending' ? 'Review' : 'Review Details'}: {selectedPr.title || selectedPr.taskName}</h3>
            <button onClick={() => setSelectedPr(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Project: <span style={{ color: 'white' }}>{selectedPr.project?.name}</span></p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Module: <span style={{ color: 'white' }}>{selectedPr.moduleName}</span></p>
          </div>

          {activeTab === 'pending' ? (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Add Finding</label>
              <textarea 
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', color: 'white', borderRadius: '0.5rem', border: '1px solid var(--border)', minHeight: '100px', marginBottom: '1rem' }}
                value={finding.description}
                onChange={e => setFinding({...finding, description: e.target.value})}
                placeholder="Describe the issue..."
              />
              
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Severity</label>
              <select 
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', color: 'white', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                value={finding.severity}
                onChange={e => setFinding({...finding, severity: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  onClick={() => handleReview('Needs Fix')} 
                  className="btn" 
                  style={{ background: 'var(--danger)', color: 'white', flex: 1 }}>
                  Reject / Needs Fix
                </button>
                <button 
                  onClick={() => handleReview('Approved')} 
                  className="btn" 
                  style={{ background: 'var(--success)', color: 'white', flex: 1 }}>
                  Approve
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Findings History</h4>
              {selectedPr.findings && selectedPr.findings.length > 0 ? (
                selectedPr.findings.map((f, i) => (
                  <div key={i} style={{ padding: '1rem', background: '#0f172a', borderRadius: '0.5rem', marginBottom: '0.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.1rem 0.5rem', 
                        borderRadius: '0.25rem',
                        background: f.severity === 'Critical' ? 'var(--danger)' : f.severity === 'High' ? '#f97316' : '#3b82f6',
                        color: 'white'
                      }}>{f.severity}</span>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: '800', 
                        textTransform: 'uppercase', 
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '0.25rem',
                        background: f.status === 'Fixed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: f.status === 'Fixed' ? 'var(--success)' : 'var(--warning)',
                        letterSpacing: '0.05em',
                        marginLeft: '0.5rem'
                      }}>{f.status || 'Open'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      By <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{f.reviewer?.name}</span> ({f.reviewer?.role})
                    </p>
                    <p style={{ fontSize: '0.9rem' }}>{f.description}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No findings recorded for this PR.</p>
              )}
              <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.5rem', border: '1px solid var(--success)' }}>
                 <p style={{ color: 'var(--success)', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>This PR has been completed.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewDashboard;
