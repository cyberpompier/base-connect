import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/Profile';
import { InstallGuide } from './pages/InstallGuide';
import { EpiPage } from './pages/EpiPage'; 
import { EpiDetailPage } from './pages/EpiDetailPage';
import { ScanPage } from './pages/ScanPage'; // Import ScanPage
import { Loader2 } from 'lucide-react'; // MoreHorizontal icon removed as it's not used directly here
import toast from 'react-hot-toast'; 
import { ScrollToTop } from './components/ScrollToTop';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

const DashboardRedirect: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Mandatory profile completion logic: check if prenom and nom are filled
  if (profile && (!profile.prenom || !profile.nom)) {
    return <Navigate to="/profile" />; // Redirect to profile editing without userId
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<InstallGuide />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            
            <Route // Modified to accept optional userId
              path="/profile/:userId?"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route // Removed MorePage route
              path="/epis"
              element={
                <ProtectedRoute>
                  <EpiPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/epis/:id"
              element={
                <ProtectedRoute>
                  <EpiDetailPage />
                </ProtectedRoute>
              }
            />
            <Route // New ScanPage route
              path="/scan"
              element={
                <ProtectedRoute>
                  <ScanPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;