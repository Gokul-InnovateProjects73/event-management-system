import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import { PublicRoute, AdminRoute, StudentRoute } from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminCreateEvent from './pages/admin/AdminCreateEvent';
import AdminRSVP from './pages/admin/AdminRSVP';
import AdminStudents from './pages/admin/AdminStudents';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCalendar from './pages/admin/AdminCalendar';

// Student pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentEvents from './pages/student/StudentEvents';
import StudentEventDetail from './pages/student/StudentEventDetail';
import StudentCalendar from './pages/student/StudentCalendar';

// Root redirect by role
const RootRedirect = () => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid #3a3a5c',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#5c7cfa', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Admin portal */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/events/create" element={<AdminCreateEvent />} />
              <Route path="/admin/events/:id/rsvps" element={<AdminRSVP />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/registrations" element={<AdminRegistrations />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/calendar" element={<AdminCalendar />} />
              <Route path="/admin/about" element={<About />} />
            </Route>
          </Route>

          {/* Student portal */}
          <Route element={<StudentRoute />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/events" element={<StudentEvents />} />
              <Route path="/student/events/:id" element={<StudentEventDetail />} />
              <Route path="/student/calendar" element={<StudentCalendar />} />
              <Route path="/student/about" element={<About />} />
            </Route>
          </Route>

          {/* Legacy redirects for old routes */}
          <Route path="/dashboard" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
