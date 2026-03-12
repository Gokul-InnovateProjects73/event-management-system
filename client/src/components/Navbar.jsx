import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Calendar, LogOut, Plus, Home, User, Menu, X,
    TrendingUp, ScanLine, Mic, Bookmark, Info
} from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout, isAdmin, isStaff } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
        { to: '/my-rsvps', label: 'My RSVPs', icon: Bookmark },
        { to: '/about', label: 'About', icon: Info },
        { to: '/speakers', label: 'Speakers', icon: Mic },
        ...(isAdmin || isStaff ? [
            { to: '/checkin', label: 'Check-In', icon: ScanLine },
        ] : []),
        ...(isAdmin || isStaff ? [
            { to: '/analytics', label: 'Analytics', icon: TrendingUp },
        ] : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-dark-800/80 backdrop-blur-lg border-b border-dark-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transition-transform group-hover:scale-105">
                            <Calendar size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
                            Event<span className="text-emerald-600">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${isActive(to)
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                    : 'text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:text-white dark:hover:bg-emerald-500/10'
                                    }`}
                            >
                                <Icon size={16} />
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* User area */}
                    <div className="hidden md:flex items-center gap-4">
                        <NotificationBell />
                        
                        <div className="flex items-center gap-3 pl-4 border-l border-stone-200 dark:border-stone-700">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                            >
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-stone-200" />
                                ) : (
                                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                                        <User size={14} className="text-white" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-[11px] font-black text-stone-900 dark:text-white leading-none uppercase tracking-tight">{user?.name?.split(' ')[0]}</p>
                                    {user?.role !== 'attendee' && (
                                        <span className="text-[9px] uppercase font-black text-emerald-600 tracking-widest">{user?.role}</span>
                                    )}
                                </div>
                            </Link>
                            <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile: notification bell + hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        <NotificationBell />
                        <button className="text-gray-400 hover:text-white p-2" onClick={() => setOpen(!open)}>
                            {open ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(to) ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-600'}`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    ))}
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-600 transition-all">
                        <User size={16} /> Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-dark-600 transition-all"
                    >
                        <LogOut size={16} /> Logout
                    </button>

                    {/* Mobile Theme Selection */}
                    <div className="mt-4 pt-4 border-t border-dark-600">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3 block">Switch Theme</span>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { id: 'purple', bg: 'bg-[#7C3AED]', label: 'Purple' },
                                { id: 'green', bg: 'bg-[#10B981]', label: 'Green' },
                                { id: 'orange', bg: 'bg-[#F97316]', label: 'Orange' },
                                { id: 'dark', bg: 'bg-[#111827]', label: 'Dark' }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => toggleTheme(t.id)}
                                    className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${theme === t.id ? 'bg-primary-500/10 border-primary-500/50 border' : 'border-transparent border'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full ${t.bg} border-2 ${theme === t.id ? 'border-white ring-2 ring-primary-500/50' : 'border-dark-400 opacity-80'}`} />
                                    <span className={`text-[10px] font-medium ${theme === t.id ? 'text-primary-400' : 'text-gray-500'}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
