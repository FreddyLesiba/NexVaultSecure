import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './store/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadDoc from './pages/UploadDoc';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Users from './pages/Users';


const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user } = useAppContext();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && window.location.pathname === '/login') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<ProtectedRoute allowedRoles={['admin', 'uploader']}><UploadDoc /></ProtectedRoute>} />
        <Route path="my-docs" element={<ProtectedRoute allowedRoles={['admin', 'uploader']}><Documents /></ProtectedRoute>} />
        <Route path="approvals" element={<ProtectedRoute allowedRoles={['admin', 'reviewer', 'manager', 'finance']}><Approvals /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'uploader']}><Reports /></ProtectedRoute>} />
        <Route path="document/:id" element={<DocumentDetail />} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
