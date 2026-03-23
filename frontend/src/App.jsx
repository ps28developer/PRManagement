import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ReviewDashboard from './pages/ReviewDashboard';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={
            <PrivateRoute roles={['Admin']}>
              <Layout><AdminDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/employee/*" element={
            <PrivateRoute roles={['Employee']}>
              <Layout><EmployeeDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/review/*" element={
            <PrivateRoute roles={['Lead Developer', 'Employee']}>
              <Layout><ReviewDashboard /></Layout>
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
