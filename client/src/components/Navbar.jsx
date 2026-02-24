import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, Plus, Home, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: Home },
        { to: '/events', label: 'Events', icon: Calendar },
        { to: '/create-event', label: 'Create', icon: Plus },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-lg border-b border-dark-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-500 rounded-lg flex items-center justify-center">
                            <Calendar size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
                            EventHub
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to)
                                        ? 'bg-primary-600/20 text-primary-400'
                                        : 'text-gray-400 hover:text-white hover:bg-dark-600'
                                    }`}
                            >
                                <Icon size={15} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* User area */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-600 border border-dark-500">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
                                <User size={12} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-200">{user?.name}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-3 !text-sm">
                            <LogOut size={15} />
                            Logout
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden text-gray-400 hover:text-white p-2" onClick={() => setOpen(!open)}>
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden border-t border-dark-600 bg-dark-800 px-4 py-4 flex flex-col gap-2 animate-fade-in">
                    {navLinks.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(to) ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-600'
                                }`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-dark-600 transition-all"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
