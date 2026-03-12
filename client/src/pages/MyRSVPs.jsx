import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rsvpAPI } from '../api/api';
import { format } from 'date-fns';
import { Calendar, MapPin, Bookmark, CheckCircle, HelpCircle, XCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    attending: {
        badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        icon: CheckCircle,
        label: 'Attending',
    },
    maybe: {
        badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        icon: HelpCircle,
        label: 'Maybe',
    },
    not_attending: {
        badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
        icon: XCircle,
        label: "Can't make it",
    },
};

const MyRSVPs = () => {
    const navigate = useNavigate();
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRSVPs = async () => {
            try {
                const res = await rsvpAPI.getMyRSVPEvents();
                setRsvps(res.data);
            } catch {
                toast.error('Failed to load your RSVPs');
            } finally {
                setLoading(false);
            }
        };
        fetchRSVPs();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Bookmark size={28} className="text-primary-400" /> My RSVPs
                </h1>
                <p className="text-gray-400 mt-1">All events you've responded to</p>
            </div>

            {rsvps.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center mx-auto mb-4">
                        <Bookmark size={28} className="text-gray-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-black mb-2">No RSVPs yet</h2>
                    <p className="text-gray-400 mb-6">Browse events and submit your first RSVP!</p>
                    <button onClick={() => navigate('/events')} className="btn-primary mx-auto text-black font-bold">
                        Browse Events
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rsvps.map((rsvp) => {
                        const ev = rsvp.event;
                        if (!ev) return null;
                        const statusConfig = STATUS_STYLES[rsvp.status] || STATUS_STYLES.attending;
                        const StatusIcon = statusConfig.icon;
                        const isPast = new Date(ev.date) < new Date();

                        return (
                            <div
                                key={rsvp._id}
                                onClick={() => navigate(`/events/${ev._id}`)}
                                className="card cursor-pointer hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col gap-4"
                            >
                                {/* Image / banner */}
                                {ev.imageUrl ? (
                                    <img src={ev.imageUrl} alt={ev.title}
                                        className="w-full h-36 object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-24 rounded-xl bg-gradient-to-br from-primary-600/40 to-violet-600/40 flex items-center justify-center">
                                        <Calendar size={32} className="text-primary-400/60" />
                                    </div>
                                )}

                                {/* Status badge */}
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`badge ${statusConfig.badge} flex items-center gap-1.5`}>
                                        <StatusIcon size={12} />
                                        {statusConfig.label}
                                    </span>
                                    {isPast && (
                                        <span className="badge bg-dark-500 text-gray-400 text-xs">Past</span>
                                    )}
                                    {rsvp.checkedIn && (
                                        <span className="badge bg-emerald-500/20 text-emerald-400 text-xs">✓ Checked In</span>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <h3 className="font-semibold text-white line-clamp-2 mb-2">{ev.title}</h3>

                                    <div className="space-y-1.5">
                                        <p className="flex items-center gap-2 text-xs text-gray-400">
                                            <Calendar size={13} className="text-primary-400 flex-shrink-0" />
                                            {format(new Date(ev.date), 'MMM d, yyyy • h:mm a')}
                                        </p>
                                        <p className="flex items-center gap-2 text-xs text-gray-400 truncate">
                                            <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
                                            {ev.location}
                                        </p>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="mt-auto flex items-center gap-1 text-xs text-primary-400 font-medium">
                                    View Event <ArrowRight size={13} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyRSVPs;
