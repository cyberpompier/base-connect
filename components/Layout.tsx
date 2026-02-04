import React from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { BottomNavBar } from './layout/BottomNavBar'; // Import BottomNavBar
import { useLocation } from 'react-router-dom'; // Import useLocation for path check

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Determine if the BottomNavBar should be shown
  // It should be shown if authenticated AND not on auth, landing, or install pages
  const showBottomNavBar = user && !loading && 
                           !['/', '/auth', '/install'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-2xl sm:min-h-0 sm:h-auto sm:rounded-3xl sm:my-8 sm:overflow-hidden relative">
        {/* Add padding-bottom to main content when nav bar is present */}
        <main className={`h-full overflow-y-auto custom-scrollbar ${showBottomNavBar ? 'pb-20' : ''}`}>
          {children}
        </main>
        {showBottomNavBar && <BottomNavBar />}
      </div>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
};
