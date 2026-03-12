import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
    LayoutDashboard, Calendar, CalendarDays, Plus, Users, LogOut, Menu, X, Shield, CheckSquare, UserCog, List
} from 'lucide-react';

const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/admin/events', label: 'Events', icon: List },
    { to: '/admin/events/create', label: 'Create Event', icon: Plus },
    { to: '/admin/users', label: 'User Management', icon: UserCog },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/registrations', label: 'Registrations', icon: CheckSquare },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const Sidebar = ({ mobile = false }) => (
        <div className={mobile
            ? 'flex flex-col h-full'
            : 'hidden lg:flex flex-col h-full'}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-600">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-500 rounded-xl flex items-center justify-center">
                    <Shield size={18} className="text-white" />
                </div>
                <div>
                    <p className="font-bold text-black text-sm leading-tight">EventHub</p>
                    <p className="text-[10px] text-primary-400 font-medium tracking-widest uppercase">Admin</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/admin/dashboard'}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/20'
                                : 'text-dark-muted hover:text-dark-text hover:bg-dark-600'
                            }`
                        }
                    >
                        <Icon size={17} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-4 py-4 border-t border-dark-600">
                <div className="flex items-center gap-3 mb-3 px-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center font-bold text-xs">
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-text truncate">{user?.name}</p>
                        <p className="text-xs text-dark-muted truncate">{user?.email}</p>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-1 transition-colors w-full">
                    <LogOut size={15} /> Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar — desktop */}
            <div className="w-60 bg-dark-800 border-r border-dark-600 flex-shrink-0 hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile overlay */}
            {open && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="w-60 bg-dark-800 border-r border-dark-600 flex flex-col">
                        <Sidebar mobile />
                    </div>
                    <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-14 bg-dark-800/80 backdrop-blur border-b border-dark-600 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
                    <button className="lg:hidden text-dark-muted hover:text-dark-text" onClick={() => setOpen(!open)}>
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <div className="flex items-center gap-2 lg:hidden">
                        <span className="font-bold text-dark-text text-sm">Admin Portal</span>
                    </div>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-2">
                        <span className="badge bg-red-500/20 text-red-400 text-xs">Admin</span>
                        <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
