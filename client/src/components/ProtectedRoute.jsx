import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Spinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

// Require authentication (any role)
export const PrivateRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Redirect authenticated users away from login/register
export const PublicRoute = () => {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Outlet />;
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} replace />;
};

// Admin-only guard
export const AdminRoute = () => {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/student/dashboard" replace />;
    return <Outlet />;
};

// Student-only guard
export const StudentRoute = () => {
    const { user, loading, isStudent } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    if (!isStudent) return <Navigate to="/admin/dashboard" replace />;
    return <Outlet />;
};
