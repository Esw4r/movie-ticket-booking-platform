// Main App Component with Routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { initializeSampleData } from './data/sampleData';
import { useEffect } from 'react';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Shows from './pages/Shows';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AllBookings from './pages/AllBookings';
import Unauthorized from './pages/Unauthorized';

import './App.css';

// Home redirect component
const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function AppContent() {
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/movies"
              element={
                <ProtectedRoute resource="movies">
                  <Movies />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shows"
              element={
                <ProtectedRoute resource="shows">
                  <Shows />
                </ProtectedRoute>
              }
            />

            <Route
              path="/book/:movieId"
              element={
                <ProtectedRoute resource="bookings" requireWrite={true}>
                  <Booking />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/all-bookings"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
                  <AllBookings />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>🔐 CineSecure - Secure Movie Booking Platform</p>
            <p className="security-badges">
              <span>🔒 AES-256</span>
              <span>🔑 RSA-2048</span>
              <span>✍️ Digital Signatures</span>
              <span>🧂 Bcrypt Hashing</span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
