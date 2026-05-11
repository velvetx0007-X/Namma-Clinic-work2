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

// Landing Pages
import SolutionsPage from './pages/landing/SolutionsPage';
import AIIntelligencePage from './pages/landing/AIIntelligencePage';
import DocumentationPage from './pages/landing/DocumentationPage';
import APIReferencePage from './pages/landing/APIReferencePage';
import BlogPage from './pages/landing/BlogPage';
import HelpCenterPage from './pages/landing/HelpCenterPage';
import AboutPage from './pages/landing/AboutPage';
import CareersPage from './pages/landing/CareersPage';
import ContactPage from './pages/landing/ContactPage';
import LegalPrivacyPage from './pages/landing/LegalPrivacyPage';
import ProductPage from './pages/landing/ProductPage';


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

        {/* New Landing Pages */}
        <Route path="/solutions" element={<PageWrapper><SolutionsPage /></PageWrapper>} />
        <Route path="/ai-intelligence" element={<PageWrapper><AIIntelligencePage /></PageWrapper>} />
        <Route path="/documentation" element={<PageWrapper><DocumentationPage /></PageWrapper>} />
        <Route path="/api-reference" element={<PageWrapper><APIReferencePage /></PageWrapper>} />
        <Route path="/blog" element={<PageWrapper><BlogPage /></PageWrapper>} />
        <Route path="/help-center" element={<PageWrapper><HelpCenterPage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/careers" element={<PageWrapper><CareersPage /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
        <Route path="/legal-privacy" element={<PageWrapper><LegalPrivacyPage /></PageWrapper>} />
        <Route path="/product" element={<PageWrapper><ProductPage /></PageWrapper>} />

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
