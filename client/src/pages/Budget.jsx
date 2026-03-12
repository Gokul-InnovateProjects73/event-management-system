import { useState, useEffect } from 'react';
import { eventAPI, rsvpAPI } from '../api/api';
import { useParams } from 'react-router-dom';
import { DollarSign, TrendingUp, Ticket, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Budget = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            eventAPI.getById(eventId),
            rsvpAPI.getForEvent(eventId),
        ])
            .then(([evRes, rsvpRes]) => {
                setEvent(evRes.data);
                setRsvps(rsvpRes.data);
            })
            .catch(() => toast.error('Failed to load budget data'))
            .finally(() => setLoading(false));
    }, [eventId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!event) return null;

    const attendingCount = rsvps.filter(r => r.status === 'attending').length;

    // Calculate ticket revenue
    const ticketRevenue = (event.ticketTypes || []).reduce((acc, tt) => acc + (tt.price * (tt.sold || 0)), 0);
    const budget = event.budget || 0;
    const roi = budget > 0 ? ((ticketRevenue / budget) * 100).toFixed(1) : null;

    // Donut chart segments
    const total = Math.max(ticketRevenue + budget, 1);
    const segments = [
        { label: 'Revenue', value: ticketRevenue, color: '#4ade80' },
        { label: 'Budget', value: budget, color: '#818cf8' },
    ];
    const circumference = 2 * Math.PI * 40;

    let offset = 0;
    const donutSegments = segments.map(seg => {
        const dash = (seg.value / total) * circumference;
        const seg2 = { ...seg, dash, offset };
        offset += dash;
        return seg2;
    });

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <DollarSign size={28} className="text-emerald-400" /> Budget Overview
                </h1>
                <p className="text-gray-400 mt-1">{event.title}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
                        <DollarSign size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Planned Budget</p>
                        <p className="text-2xl font-bold text-white">${budget.toLocaleString()}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Ticket Revenue</p>
                        <p className="text-2xl font-bold text-white">${ticketRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
                        <Users size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Attending</p>
                        <p className="text-2xl font-bold text-white">{attendingCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart */}
                <div className="card flex flex-col items-center">
                    <h2 className="font-semibold text-white mb-4 self-start">Revenue vs Budget</h2>
                    {budget === 0 && ticketRevenue === 0 ? (
                        <p className="text-gray-500 text-sm">No financial data yet</p>
                    ) : (
                        <>
                            <svg viewBox="0 0 100 100" className="w-40 h-40">
                                {donutSegments.map((seg, i) => (
                                    <circle
                                        key={i}
                                        cx="50" cy="50" r="40"
                                        fill="none"
                                        stroke={seg.color}
                                        strokeWidth="16"
                                        strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                                        strokeDashoffset={-seg.offset}
                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                    />
                                ))}
                                <text x="50" y="54" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
                                    {roi ? `${roi}%` : 'N/A'}
                                </text>
                                <text x="50" y="65" textAnchor="middle" fontSize="6" fill="#9ca3af">ROI</text>
                            </svg>
                            <div className="flex gap-6 mt-4">
                                {segments.map(seg => (
                                    <div key={seg.label} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="text-xs text-gray-400">{seg.label}: <strong className="text-white">${seg.value.toLocaleString()}</strong></span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Ticket Breakdown */}
                <div className="card">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Ticket size={18} className="text-primary-400" /> Ticket Types
                    </h2>
                    {(!event.ticketTypes || event.ticketTypes.length === 0) ? (
                        <p className="text-gray-500 text-sm">No ticket types configured</p>
                    ) : (
                        <div className="space-y-3">
                            {event.ticketTypes.map((tt, i) => {
                                const revenue = tt.price * (tt.sold || 0);
                                const fillPct = tt.capacity > 0 ? Math.min(((tt.sold || 0) / tt.capacity) * 100, 100) : 0;
                                return (
                                    <div key={i} className="p-3 bg-dark-600 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-medium text-white">{tt.name}</span>
                                                <span className="ml-2 badge bg-primary-500/20 text-primary-400 text-xs">
                                                    {tt.price > 0 ? `$${tt.price}` : 'Free'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-emerald-400 font-medium">${revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-dark-400 rounded-full h-1.5">
                                                <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                                            </div>
                                            <span className="text-xs text-gray-500">{tt.sold || 0}/{tt.capacity}</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex items-center justify-between pt-2 border-t border-dark-500">
                                <span className="text-sm text-gray-400">Total Revenue</span>
                                <span className="text-lg font-bold text-emerald-400">${ticketRevenue.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Budget;
