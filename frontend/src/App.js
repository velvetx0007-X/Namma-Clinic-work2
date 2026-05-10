import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClinicAdminDashboard from './pages/ClinicAdminDashboard';
import ReviewPage from './pages/ReviewPage';
import SplashScreen from './components/common/SplashScreen';
import AdvancedAIView from './components/AdvancedAIView';
import PatientRecordsPage from './pages/PatientRecordsPage';
import PatientUploadPage from './pages/PatientUploadPage';
import PatientFeedbackPage from './pages/PatientFeedbackPage';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Role-Based Protected Route Component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their own dashboard if they try to access an unauthorized one
    const dashboardMap = {
      admin: '/admin-dashboard',
      clinic: '/clinic-admin-dashboard',
      patient: '/patient-dashboard',
      doctor: '/doctor-dashboard',
      nurse: '/nurse-dashboard',
      receptionist: '/receptionist-dashboard'
    };
    return <Navigate to={dashboardMap[user.role] || '/home'} replace />;
  }

  return children;
};

// Public Route Component (redirect to specific dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    const dashboardMap = {
      admin: '/admin-dashboard',
      clinic: '/clinic-admin-dashboard',
      patient: '/patient-dashboard',
      doctor: '/doctor-dashboard',
      nurse: '/nurse-dashboard',
      receptionist: '/receptionist-dashboard'
    };
    return <Navigate to={dashboardMap[user.role] || '/home'} replace />;
  }
  
  return children;
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Default route - Landing Page */}
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />

        {/* Public routes */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <PageWrapper><SignupPage /></PageWrapper>
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <PageWrapper><LoginPage /></PageWrapper>
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <PageWrapper><HomePage /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Role-specific dashboards */}
        <Route
          path="/doctor-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['doctor']}>
              <PageWrapper><DoctorDashboard /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/nurse-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['nurse']}>
              <PageWrapper><NurseDashboard /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/receptionist-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['receptionist']}>
              <PageWrapper><ReceptionistDashboard /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/patient-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <PageWrapper><PatientDashboard /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/patient/records"
          element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <PageWrapper><PatientRecordsPage /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/patient/upload-records"
          element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <PageWrapper><PatientUploadPage /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/patient/feedback"
          element={
            <RoleProtectedRoute allowedRoles={['patient']}>
              <PageWrapper><PatientFeedbackPage /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/clinic-admin-dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['clinic']}>
              <PageWrapper><ClinicAdminDashboard /></PageWrapper>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/ai-assistance/:module"
          element={
            <ProtectedRoute>
              <PageWrapper><AIViewWrapper /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <RoleProtectedRoute allowedRoles={['patient', 'clinic', 'admin']}>
              <PageWrapper><ReviewPage /></PageWrapper>
            </RoleProtectedRoute>
          }
        />

        {/* Catch all - redirect to signup */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const AIViewWrapper = () => {
  const { module } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AdvancedAIView 
      module={module.replace(/-/g, ' ')} 
      user={user} 
      onClose={() => navigate(-1)} 
    />
  );
};

function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SplashScreen onComplete={() => setShowSplash(false)} />
            </motion.div>
          ) : (
            <Router key="router">
              <AnimatedRoutes />
            </Router>
          )}
        </AnimatePresence>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
