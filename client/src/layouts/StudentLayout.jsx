import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { LayoutDashboard, Calendar, BookOpen, LogOut, Menu, X } from 'lucide-react';

const links = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/events', label: 'Events', icon: BookOpen },
    { to: '/student/calendar', label: 'Calendar', icon: Calendar },
];

const DEPT_COLORS = {
    CSE: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    ECE: 'bg-teal-500/10 text-teal-600 border-teal-200',
    MECH: 'bg-amber-500/10 text-amber-600 border-amber-200',
    IT: 'bg-green-500/10 text-green-600 border-green-200',
    CIVIL: 'bg-stone-500/10 text-stone-600 border-stone-200',
    MBA: 'bg-pink-500/10 text-pink-600 border-pink-200',
    OTHER: 'bg-stone-500/10 text-stone-600 border-stone-200',
};

const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };
    const deptClass = DEPT_COLORS[user?.department] || 'bg-gray-500/20 text-gray-400';

    return (
        <div className="min-h-screen bg-[rgb(var(--color-background))] flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl border-b border-[rgb(var(--color-border))]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/student/dashboard')}>
                            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none transition-transform group-hover:scale-105">
                                <span className="text-white text-lg">🎓</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter text-stone-900 dark:text-white uppercase">
                                Event<span className="text-emerald-600">Hub</span>
                            </span>
                        </div>

                        {/* Desktop links */}
                        <div className="hidden md:flex items-center gap-2">
                            {links.map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={to === '/student/dashboard'}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${isActive
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                            : 'text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-stone-400 dark:hover:text-white dark:hover:bg-emerald-500/10'
                                        }`
                                    }
                                >
                                    <Icon size={16} /> {label}
                                </NavLink>
                            ))}
                        </div>

                        {/* Right: user info */}
                        <div className="hidden md:flex items-center gap-4">
                            {user?.department && (
                                <span className={`badge border ${deptClass}`}>{user.department}</span>
                            )}
                            <div className="flex items-center gap-3 pl-4 border-l border-stone-200 dark:border-stone-700">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-stone-900 dark:text-white leading-tight">{user?.name?.split(' ')[0]}</p>
                                    {user?.rollNumber && <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-tight">{user.rollNumber}</p>}
                                </div>
                                <button onClick={handleLogout}
                                    className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                                    title="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Mobile hamburger */}
                        <button className="md:hidden text-gray-400 hover:text-white p-2" onClick={() => setOpen(!open)}>
                            {open ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden border-t border-dark-600 bg-dark-800 px-4 py-4 space-y-2">
                        {links.map(({ to, label, icon: Icon }) => (
                            <NavLink key={to} to={to} end={to === '/student/dashboard'}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-dark-600'}`
                                }>
                                <Icon size={16} /> {label}
                            </NavLink>
                        ))}
                        <div className="flex items-center justify-between pt-3 border-t border-dark-600 px-1">
                            <div>
                                <p className="text-sm text-dark-text font-medium">{user?.name}</p>
                                {user?.rollNumber && <p className="text-xs text-dark-muted">{user.rollNumber} · {user.department}</p>}
                            </div>
                            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
