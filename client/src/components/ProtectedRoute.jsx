import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap protected routes
export const PrivateRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Redirect authenticated users away from auth pages
export const PublicRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
