import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, eventAPI, analyticsAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, BookMarked, TrendingUp, Plus, ArrowRight, Activity, Clock, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className="card flex items-start gap-4 hover:-translate-y-1 transition-transform duration-200">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold text-black mt-1">{value ?? '—'}</p>
            {subtext && <p className="text-xs text-primary-500 mt-1 font-medium">{subtext}</p>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Data States
    const [stats, setStats] = useState(null);
    const [overview, setOverview] = useState(null);
    const [myEvents, setMyEvents] = useState([]);
    const [deptData, setDeptData] = useState([]);
    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [statsRes, overviewRes, eventsRes, deptRes, recentRes] = await Promise.all([
                    adminAPI.getStats(),
                    analyticsAPI.getOverview(),
                    eventAPI.getMyEvents(),
                    adminAPI.getRSVPsByDept(),
                    analyticsAPI.getRecentActivity(),
                ]);
                
                setStats(statsRes.data);
                setOverview(overviewRes.data);
                setMyEvents(eventsRes.data.slice(0, 4)); // Get top 4 upcoming/recent
                setDeptData(deptRes.data);
                setRecentRegistrations(recentRes.data.slice(0, 5)); // Get top 5 recent
            } catch (error) {
                console.error("Dashboard Load Error:", error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const maxDeptCount = Math.max(...deptData.map(d => d.count), 1);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-black">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-gray-500 mt-2">Here is what's happening with your events today.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/admin/registrations')} className="btn-secondary whitespace-nowrap">
                        <Users size={18} /> View All RSVPs
                    </button>
                    <button onClick={() => navigate('/admin/events/create')} className="btn-primary whitespace-nowrap shadow-lg shadow-primary-500/20">
                        <Plus size={18} /> Create Event
                    </button>
                </div>
            </div>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    icon={Calendar} 
                    label="Total Events" 
                    value={overview?.totalEvents || stats?.totalEvents} 
                    subtext="Active platform wide"
                    color="bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20" 
                />
                <StatCard 
                    icon={BookMarked} 
                    label="Total RSVPs" 
                    value={overview?.totalRSVPs || stats?.totalRSVPs} 
                    subtext="Registrations submitted"
                    color="bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/20" 
                />
                <StatCard 
                    icon={Users} 
                    label="Registered Students" 
                    value={overview?.totalUsers || stats?.totalStudents} 
                    subtext="Active accounts"
                    color="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20" 
                />
                <StatCard 
                    icon={Activity} 
                    label="Engagement Rate" 
                    value={`${overview?.checkInRate || 0}%`} 
                    subtext="Avg. Event Check-ins"
                    color="bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/20" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Wider) */}
                <div className="col-span-1 lg:col-span-2 space-y-8">
                    
                    {/* Event Status & Seat Availability */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                <Calendar size={20} className="text-primary-500" /> Event Seat Availability
                            </h2>
                            <button onClick={() => navigate('/admin/events')} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
                                View all events <ArrowRight size={14} />
                            </button>
                        </div>
                        
                        {myEvents.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No upcoming events found.</p>
                        ) : (
                            <div className="space-y-6">
                                {myEvents.map((ev) => {
                                    // Calculate progress (safeguard against zero capacity)
                                    const capacity = ev.capacity || 100; // fallback if infinite/0
                                    const rsvpCount = ev.rsvpCount || 0; // assuming this is attached, if not we show 0
                                    const percentage = Math.min(Math.round((rsvpCount / capacity) * 100), 100);
                                    
                                    // Color logic based on how full the event is
                                    let barColor = "from-emerald-400 to-emerald-500";
                                    if (percentage > 70) barColor = "from-yellow-400 to-orange-500";
                                    if (percentage > 90) barColor = "from-red-400 to-rose-500";

                                    return (
                                        <div key={ev._id} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="min-w-0 pr-4">
                                                    <p className="text-sm font-bold text-black truncate">{ev.title}</p>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {format(new Date(ev.date), 'MMM d, yyyy')} • {ev.location}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <button onClick={() => navigate(`/admin/events/${ev._id}/rsvps`)} 
                                                        className="text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-full transition-colors">
                                                        Manage RSVPs
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                                    <div 
                                                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-gray-700 w-24 text-right">
                                                    {rsvpCount} / {ev.capacity ? ev.capacity : '∞'} seats
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Student Registrations */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-black flex items-center gap-2">
                                <Clock size={20} className="text-primary-500" /> Recent Registrations
                            </h2>
                            <button onClick={() => navigate('/admin/registrations')} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors">
                                View all <ArrowRight size={14} />
                            </button>
                        </div>

                        {recentRegistrations.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No recent registrations.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentRegistrations.map((rsvp) => (
                                    <div key={rsvp._id} className="flex items-center justify-between py-4 hover:bg-gray-50 transition-colors -mx-4 px-4 rounded-xl">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                                                {rsvp.user?.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-black truncate">{rsvp.user?.name || 'Unknown Student'}</p>
                                                <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                                    registered for <span className="font-semibold text-gray-700">{rsvp.event?.title || 'an event'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-medium text-gray-400">
                                                {format(new Date(rsvp.createdAt), 'MMM d, h:mm a')}
                                            </span>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    rsvp.status === 'attending' ? 'bg-emerald-100 text-emerald-700' :
                                                    rsvp.status === 'maybe' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {rsvp.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column (Narrower) */}
                <div className="col-span-1 space-y-8">
                    
                    {/* Participation Analytics (Department Chart) */}
                    <div className="card h-full">
                        <h2 className="text-lg font-bold text-black flex items-center gap-2 mb-6">
                            <TrendingUp size={20} className="text-primary-500" /> Participation by Dept
                        </h2>
                        
                        {deptData.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No participation data available.</p>
                        ) : (
                            <div className="space-y-4">
                                {deptData.map(({ _id, count }, index) => {
                                    const percentage = Math.round((count / maxDeptCount) * 100);
                                    // Use varying colors for the top 3, then a default color
                                    const colors = [
                                        "from-blue-500 to-indigo-500",
                                        "from-violet-500 to-purple-500",
                                        "from-emerald-400 to-teal-500"
                                    ];
                                    const colorClass = index < 3 ? colors[index] : "from-gray-400 to-gray-500";

                                    return (
                                        <div key={_id || index} className="group">
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                                    <Building2 size={12} className="text-gray-400"/> {_id || 'Other'}
                                                </span>
                                                <span className="text-xs font-bold text-black">{count}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-sm h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                    <p className="text-xs font-medium text-gray-500 mb-1">Total Campus Reach</p>
                                    <p className="text-2xl font-black text-black">
                                        {deptData.reduce((acc, curr) => acc + curr.count, 0)} RSVPs
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

