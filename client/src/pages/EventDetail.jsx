import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, rsvpAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import {
    Calendar, MapPin, Users, ArrowLeft, Trash2, CheckCircle,
    HelpCircle, XCircle, Clock, Globe, Lock, User,
} from 'lucide-react';
import CategoryBadge from '../components/CategoryBadge';
import toast from 'react-hot-toast';

const RSVP_OPTIONS = [
    { value: 'attending', label: 'Attending', icon: CheckCircle, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
    { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
    { value: 'not_attending', label: "Can't make it", icon: XCircle, color: 'border-red-500 bg-red-500/10 text-red-400' },
];

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [rsvps, setRsvps] = useState([]);
    const [myRsvp, setMyRsvp] = useState(null);
    const [rsvpStatus, setRsvpStatus] = useState('attending');
    const [rsvpNote, setRsvpNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [evRes, rsvpsRes, myRsvpRes] = await Promise.all([
                    eventAPI.getById(id),
                    rsvpAPI.getForEvent(id),
                    rsvpAPI.getMyRSVP(id),
                ]);
                setEvent(evRes.data);
                setRsvps(rsvpsRes.data);
                if (myRsvpRes.data) {
                    setMyRsvp(myRsvpRes.data);
                    setRsvpStatus(myRsvpRes.data.status);
                    setRsvpNote(myRsvpRes.data.note || '');
                }
            } catch {
                toast.error('Event not found');
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleRSVP = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await rsvpAPI.submit({ eventId: id, status: rsvpStatus, note: rsvpNote });
            setMyRsvp(res.data);
            // Refresh rsvp list
            const rsvpsRes = await rsvpAPI.getForEvent(id);
            setRsvps(rsvpsRes.data);
            toast.success('RSVP submitted! ✅');
        } catch {
            toast.error('Failed to submit RSVP');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this event? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await eventAPI.delete(id);
            toast.success('Event deleted');
            navigate('/events');
        } catch {
            toast.error('Failed to delete event');
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!event) return null;

    const isOrganizer = user?._id === event.organizer?._id;
    const attendingCount = rsvps.filter((r) => r.status === 'attending').length;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back to Events
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Event Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero image or gradient banner */}
                    {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover rounded-2xl" />
                    ) : (
                        <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
                            <Calendar size={48} className="text-white/40" />
                        </div>
                    )}

                    {/* Title & category */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <CategoryBadge category={event.category} />
                                    <span className={`badge ${event.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {event.isPublic ? <><Globe size={10} className="mr-1" />Public</> : <><Lock size={10} className="mr-1" />Private</>}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-white">{event.title}</h1>
                            </div>
                            {isOrganizer && (
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="btn-danger !py-2 !px-3"
                                >
                                    {deleting
                                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <Trash2 size={16} />}
                                    Delete
                                </button>
                            )}
                        </div>

                        <p className="text-gray-300 leading-relaxed">{event.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-3 p-3 bg-dark-600 rounded-xl">
                                <Clock size={18} className="text-primary-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Starts</p>
                                    <p className="text-sm text-white font-medium">{format(new Date(event.date), 'MMM d, yyyy • h:mm a')}</p>
                                </div>
                            </div>
                            {event.endDate && (
                                <div className="flex items-center gap-3 p-3 bg-dark-600 rounded-xl">
                                    <Clock size={18} className="text-violet-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Ends</p>
                                        <p className="text-sm text-white font-medium">{format(new Date(event.endDate), 'MMM d, yyyy • h:mm a')}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 p-3 bg-dark-600 rounded-xl">
                                <MapPin size={18} className="text-emerald-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm text-white font-medium">{event.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-dark-600 rounded-xl">
                                <Users size={18} className="text-yellow-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Capacity</p>
                                    <p className="text-sm text-white font-medium">{attendingCount} / {event.capacity} attending</p>
                                </div>
                            </div>
                        </div>

                        {/* Organizer */}
                        <div className="flex items-center gap-3 pt-2 border-t border-dark-500">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center font-bold text-sm">
                                {event.organizer?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Organized by</p>
                                <p className="text-sm text-white font-medium">{event.organizer?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Attendees */}
                    {rsvps.length > 0 && (
                        <div className="glass-card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Users size={18} className="text-primary-400" /> Attendees ({rsvps.length})
                            </h2>
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {rsvps.map((r) => (
                                    <div key={r._id} className="flex items-center justify-between p-2.5 bg-dark-600 rounded-lg">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-xs font-bold">
                                                {r.user?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-200">{r.user?.name}</span>
                                        </div>
                                        <span className={`badge text-xs ${r.status === 'attending' ? 'bg-emerald-500/20 text-emerald-400' :
                                                r.status === 'maybe' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {r.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: RSVP Panel */}
                <div>
                    <div className="glass-card p-6 sticky top-24">
                        <h2 className="font-semibold text-white text-lg mb-1">
                            {myRsvp ? 'Update your RSVP' : 'RSVP to this Event'}
                        </h2>
                        {myRsvp && (
                            <p className="text-xs text-gray-500 mb-4">
                                Your current status: <span className="text-primary-400 capitalize">{myRsvp.status.replace('_', ' ')}</span>
                            </p>
                        )}

                        <form onSubmit={handleRSVP} className="mt-4 space-y-4">
                            <div className="space-y-2">
                                {RSVP_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                                    <label
                                        key={value}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${rsvpStatus === value ? color : 'border-dark-500 hover:border-dark-400'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="rsvpStatus"
                                            value={value}
                                            checked={rsvpStatus === value}
                                            onChange={() => setRsvpStatus(value)}
                                            className="hidden"
                                        />
                                        <Icon size={18} />
                                        <span className="text-sm font-medium">{label}</span>
                                    </label>
                                ))}
                            </div>

                            <div>
                                <label className="label">Note (optional)</label>
                                <textarea
                                    id="rsvp-note"
                                    rows={2}
                                    placeholder="Any message for the organizer..."
                                    value={rsvpNote}
                                    onChange={(e) => setRsvpNote(e.target.value)}
                                    className="input-field resize-none text-sm"
                                />
                            </div>

                            <button type="submit" disabled={submitting} className="btn-primary w-full">
                                {submitting
                                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : myRsvp ? '✅ Update RSVP' : '🎟️ Submit RSVP'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetail;
