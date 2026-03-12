import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, Users, Calendar, CheckSquare, Star,
    Activity, BarChart2, PieChart,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
    conference: '#5c7cfa',
    workshop: '#74c0fc',
    social: '#a9e34b',
    sports: '#ff6b6b',
    music: '#cc5de8',
    other: '#ffd43b',
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="card flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-black">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// Simple inline SVG bar chart
const BarChart = ({ data }) => {
    if (!data || data.length === 0) return <p className="text-gray-500 text-sm">No data yet.</p>;
    const maxVal = Math.max(...data.map(d => d.attendeeCount || 0), 1);
    return (
        <div className="flex items-end gap-3 h-40 mt-4">
            {data.map((d) => {
                const pct = ((d.attendeeCount || 0) / maxVal) * 100;
                const color = CATEGORY_COLORS[d.category] || '#5c7cfa';
                return (
                    <div key={d.category} className="flex flex-col items-center flex-1 gap-1">
                        <span className="text-xs text-gray-400 font-medium">{d.attendeeCount}</span>
                        <div
                            className="w-full rounded-t-lg min-h-[4px] transition-all duration-500"
                            style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-500 capitalize truncate w-full text-center">{d.category}</span>
                    </div>
                );
            })}
        </div>
    );
};

// Simple inline SVG line chart for registrations over time
const LineChart = ({ data }) => {
    if (!data || data.length === 0) return <p className="text-gray-500 text-sm">No registration data yet.</p>;
    const maxVal = Math.max(...data.map(d => d.count), 1);
    const W = 600, H = 140, PAD = 20;
    const pts = data.map((d, i) => {
        const x = PAD + (i / (data.length - 1 || 1)) * (W - PAD * 2);
        const y = H - PAD - ((d.count / maxVal) * (H - PAD * 2));
        return `${x},${y}`;
    });
    const polyline = pts.join(' ');
    const areaPath = `M ${pts[0]} ${pts.slice(1).map(p => 'L ' + p).join(' ')} L ${pts[pts.length - 1].split(',')[0]},${H - PAD} L ${PAD},${H - PAD} Z`;

    return (
        <div className="overflow-x-auto mt-4">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5c7cfa" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#5c7cfa" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#lineGrad)" />
                <polyline points={polyline} fill="none" stroke="#5c7cfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {data.map((d, i) => {
                    const [x, y] = pts[i].split(',');
                    return <circle key={i} cx={x} cy={y} r="3.5" fill="#5c7cfa" />;
                })}
                {/* X labels - show only every 5th label */}
                {data.map((d, i) => {
                    if (i % 5 !== 0 && i !== data.length - 1) return null;
                    const [x] = pts[i].split(',');
                    return (
                        <text key={`lbl-${i}`} x={x} y={H - 4} textAnchor="middle" fontSize="8" fill="#6b7280">
                            {d._id?.slice(5)}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

const Analytics = () => {
    const { isAdmin, isStaff } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [timeSeries, setTimeSeries] = useState([]);
    const [byCategory, setByCategory] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin && !isStaff) {
            navigate('/dashboard');
            return;
        }
        const fetchAll = async () => {
            try {
                const [ov, ts, cat, act] = await Promise.all([
                    analyticsAPI.getOverview(),
                    analyticsAPI.getRegistrationsOverTime(),
                    analyticsAPI.getByCategory(),
                    analyticsAPI.getRecentActivity(),
                ]);
                setOverview(ov.data);
                setTimeSeries(ts.data);
                setByCategory(cat.data);
                setRecentActivity(act.data);
            } catch {
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [isAdmin, isStaff, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <TrendingUp size={28} className="text-primary-400" /> Analytics Dashboard
                </h1>
                <p className="text-gray-400 mt-1">Real-time insights across all events and attendees</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Total Events" value={overview?.totalEvents ?? 0} color="bg-primary-600" />
                <StatCard icon={Users} label="Total RSVPs" value={overview?.totalRSVPs ?? 0} color="bg-violet-600" />
                <StatCard icon={CheckSquare} label="Checked In" value={overview?.checkedIn ?? 0}
                    sub={`${overview?.checkInRate ?? 0}% check-in rate`} color="bg-emerald-600" />
                <StatCard icon={Star} label="Total Users" value={overview?.totalUsers ?? 0} color="bg-yellow-600" />
            </div>

            {/* Most Popular Event */}
            {overview?.mostPopular && (
                <div className="card flex items-center gap-4">
                    <Activity size={20} className="text-primary-400 flex-shrink-0" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Most Popular Event</p>
                        <p className="text-white font-semibold">{overview.mostPopular.title}</p>
                        <p className="text-sm text-primary-400">{overview.mostPopular.count} attendees</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registrations Over Time */}
                <div className="card">
                    <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                        <Activity size={18} className="text-primary-400" /> Registrations (Last 30 Days)
                    </h2>
                    <p className="text-xs text-gray-500">Daily RSVP submissions over the past month</p>
                    <LineChart data={timeSeries} />
                </div>

                {/* Attendees by Category */}
                <div className="card">
                    <h2 className="font-semibold text-white flex items-center gap-2 mb-2">
                        <BarChart2 size={18} className="text-primary-400" /> Attendees by Category
                    </h2>
                    <p className="text-xs text-gray-500">Total attending RSVPs per event category</p>
                    <BarChart data={byCategory} />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                    <PieChart size={18} className="text-primary-400" /> Recent Activity
                </h2>
                {recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activity.</p>
                ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {recentActivity.map((r) => (
                            <div key={r._id} className="flex items-center justify-between p-3 bg-dark-600 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {r.user?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{r.user?.name}</p>
                                        <p className="text-xs text-gray-500">RSVP'd to <span className="text-primary-400">{r.event?.title}</span></p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {r.createdAt ? format(new Date(r.createdAt), 'MMM d') : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
