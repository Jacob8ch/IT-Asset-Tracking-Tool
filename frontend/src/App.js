import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AssetInventory from './pages/AssetInventory';
import AssetDetails from './pages/AssetDetails';
import BarcodeScanner from './pages/BarcodeScanner';
import LoanerManagement from './pages/LoanerManagement';
import TicketTracking from './pages/TicketTracking';
import TicketDetails from './pages/TicketDetails';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Auth Context
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel p-8">
          <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel p-8">
          <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AssetInventory />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/assets/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AssetDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <BarcodeScanner />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/loaners"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LoanerManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketTracking />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TicketDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <MainLayout>
                    <AdminPanel />
                  </MainLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
