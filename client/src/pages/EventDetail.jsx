import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventAPI, rsvpAPI, speakerAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import {
    Calendar, MapPin, Users, ArrowLeft, Trash2, CheckCircle,
    HelpCircle, XCircle, Clock, Globe, Lock, User,
    Mic, DollarSign, Link as LinkIcon, Ticket, ListOrdered,
    Briefcase, Building2, Pencil, Crown, Download,
} from 'lucide-react';
import CategoryBadge from '../components/CategoryBadge';
import RegistrationModal from '../components/RegistrationModal';
import toast from 'react-hot-toast';

const RSVP_OPTIONS = [
    { value: 'attending', label: 'Attending', icon: CheckCircle, color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400' },
    { value: 'maybe', label: 'Maybe', icon: HelpCircle, color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
    { value: 'not_attending', label: "Can't make it", icon: XCircle, color: 'border-red-500 bg-red-500/10 text-red-400' },
];

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    isPast: false
                };
            } else {
                timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
            }
            return timeLeft;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (timeLeft.isPast) return null;

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center px-3 py-2 bg-dark-600 rounded-lg min-w-[60px] border border-dark-500">
            <span className="text-xl font-bold text-primary-400">{String(value).padStart(2, '0')}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{label}</span>
        </div>
    );

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 uppercase tracking-wider">
                <Clock size={12} className="text-primary-400" /> Starts In
            </p>
            <div className="flex gap-2">
                <TimeUnit value={timeLeft.days} label="Days" />
                <TimeUnit value={timeLeft.hours} label="Hrs" />
                <TimeUnit value={timeLeft.minutes} label="Min" />
                <TimeUnit value={timeLeft.seconds} label="Sec" />
            </div>
        </div>
    );
};

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [event, setEvent] = useState(null);
    const [rsvps, setRsvps] = useState([]);
    const [speakers, setSpeakers] = useState([]);
    const [myRsvp, setMyRsvp] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    // For editing existing RSVPs
    const [rsvpStatus, setRsvpStatus] = useState('attending');
    const [rsvpNote, setRsvpNote] = useState('');
    const [selectedTicket, setSelectedTicket] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [evRes, rsvpsRes, myRsvpRes, speakersRes] = await Promise.all([
                    eventAPI.getById(id),
                    rsvpAPI.getForEvent(id),
                    rsvpAPI.getMyRSVP(id),
                    speakerAPI.getForEvent(id),
                ]);
                setEvent(evRes.data);
                setRsvps(rsvpsRes.data);
                setSpeakers(speakersRes.data);
                if (myRsvpRes.data) {
                    setMyRsvp(myRsvpRes.data);
                    setRsvpStatus(myRsvpRes.data.status);
                    setRsvpNote(myRsvpRes.data.note || '');
                    setSelectedTicket(myRsvpRes.data.ticketType || '');
                }
                // Set default ticket
                if (!myRsvpRes.data && evRes.data?.ticketTypes?.length > 0) {
                    setSelectedTicket(evRes.data.ticketTypes[0].name);
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

    const handleRSVP = async (formData) => {
        setSubmitting(true);
        try {
            const res = await rsvpAPI.submit({
                eventId: id,
                ...formData
            });
            setMyRsvp(res.data);
            const rsvpsRes = await rsvpAPI.getForEvent(id);
            setRsvps(rsvpsRes.data);
            setIsRegisterModalOpen(false);
            toast.success('Registration submitted! ✅');
        } catch {
            toast.error('Failed to submit registration');
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

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await rsvpAPI.export(id);
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `registrations_${event.title.replace(/\s+/g, '_')}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Export downloaded successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!event) return null;

    const isOrganizer = String(user?._id) === String(event.organizer?._id);
    const attendingCount = rsvps.filter((r) => r.status === 'attending').length;
    const hasTickets = event.ticketTypes && event.ticketTypes.length > 0;
    const hasAgenda = event.agenda && event.agenda.length > 0;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back to Events
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Event Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero */}
                    {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover rounded-2xl" />
                    ) : (
                        <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
                            <Calendar size={48} className="text-white/40" />
                        </div>
                    )}

                    {/* Title & Meta */}
                    <div className="glass-card p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <CategoryBadge category={event.category} />
                                    <span className={`badge ${event.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {event.isPublic ? <><Globe size={10} className="mr-1" />Public</> : <><Lock size={10} className="mr-1" />Private</>}
                                    </span>
                                    {event.status !== 'published' && (
                                        <span className={`badge capitalize ${event.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {event.status}
                                        </span>
                                    )}
                                    {event.virtualLink && (
                                        <a href={event.virtualLink} target="_blank" rel="noreferrer"
                                            className="badge bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
                                            <LinkIcon size={10} className="mr-1" />Virtual
                                        </a>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-white">{event.title}</h1>
                                {event.tags && event.tags.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap mt-2">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="badge bg-dark-500 text-gray-400 text-xs">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {(isOrganizer || isAdmin) && (
                                    <button onClick={handleExport} disabled={exporting} className="btn-secondary hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50 !py-2 !px-3 text-sm">
                                        {exporting ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Download size={15} />}
                                        Export
                                    </button>
                                )}
                                {(isOrganizer || isAdmin) && (
                                    <button onClick={() => navigate(`/budget/${event._id}`)} className="btn-secondary !py-2 !px-3 text-sm">
                                        <DollarSign size={15} /> Budget
                                    </button>
                                )}
                                {(isOrganizer || isAdmin) && (
                                    <Link to={`/edit-event/${event._id}`} className="btn-secondary !py-2 !px-3 text-sm">
                                        <Pencil size={15} /> Edit
                                    </Link>
                                )}
                                {(isOrganizer || isAdmin) && (
                                    <button onClick={handleDelete} disabled={deleting} className="btn-danger !py-2 !px-3">
                                        {deleting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                                        Delete
                                    </button>
                                )}
                            </div>
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

                        {/* Countdown */}
                        {new Date(event.date) > new Date() && (
                            <div className="pt-2">
                                <CountdownTimer targetDate={event.date} />
                            </div>
                        )}

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

                    {/* Agenda */}
                    {hasAgenda && (
                        <div className="glass-card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <ListOrdered size={18} className="text-primary-400" /> Agenda
                            </h2>
                            <div className="relative">
                                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-dark-400" />
                                <div className="space-y-4">
                                    {event.agenda.map((item, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            <div className="w-7 h-7 rounded-full bg-primary-600 border-2 border-dark-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 z-10">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                {item.time && (
                                                    <p className="text-xs text-primary-400 font-medium mb-0.5 flex items-center gap-1">
                                                        <Clock size={10} />{item.time}
                                                    </p>
                                                )}
                                                <p className="text-sm font-semibold text-white">{item.title}</p>
                                                {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Speakers */}
                    {speakers.length > 0 && (
                        <div className="glass-card p-6">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Mic size={18} className="text-primary-400" /> Speakers ({speakers.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {speakers.map((s) => (
                                    <div key={s._id} className="flex items-start gap-3 p-3 bg-dark-600 rounded-xl">
                                        {s.photo ? (
                                            <img src={s.photo} alt={s.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center font-bold flex-shrink-0">
                                                {s.name[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white">{s.name}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                {s.title && <span className="flex items-center gap-1 text-xs text-primary-400"><Briefcase size={9} />{s.title}</span>}
                                                {s.company && <span className="flex items-center gap-1 text-xs text-gray-400"><Building2 size={9} />{s.company}</span>}
                                            </div>
                                            {s.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.bio}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                            <div>
                                                <span className="text-sm text-gray-200">{r.user?.name}</span>
                                                {r.ticketType && <span className="ml-2 text-xs text-gray-500">({r.ticketType})</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {r.checkedIn && <span className="badge bg-emerald-500/20 text-emerald-400 text-xs">✓ In</span>}
                                            <span className={`badge text-xs ${r.status === 'attending' ? 'bg-emerald-500/20 text-emerald-400' :
                                                r.status === 'maybe' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {r.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: RSVP Panel */}
                <div>
                    {isOrganizer ? (
                        /* Organizer notice — no RSVP allowed on own event */
                        <div className="glass-card p-6 sticky top-24 space-y-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center mx-auto">
                                <Crown size={26} className="text-white" />
                            </div>
                            <h2 className="font-semibold text-white text-lg">You are the organizer</h2>
                            <p className="text-sm text-gray-400">
                                You organised this event and cannot RSVP to it.
                            </p>
                            <Link to={`/edit-event/${event._id}`} className="btn-primary w-full justify-center">
                                <Pencil size={16} /> Edit Event
                            </Link>
                        </div>
                    ) : (
                        <div className="glass-card p-6 sticky top-24 space-y-4">
                            <h2 className="font-semibold text-white text-lg mb-1">
                                {myRsvp ? 'Update your RSVP' : 'RSVP to this Event'}
                            </h2>
                            {myRsvp && (
                                <p className="text-xs text-gray-500">
                                    Your status: <span className="text-primary-400 capitalize">{myRsvp.status.replace('_', ' ')}</span>
                                </p>
                            )}

                            {/* Registration Button */}
                            <button
                                onClick={() => setIsRegisterModalOpen(true)}
                                className="btn-primary w-full py-3 text-base shadow-lg shadow-primary-500/20"
                            >
                                {myRsvp ? '✅ Manage Registration' : '🎟️ Register for Event'}
                            </button>

                            {/* Check-in token display */}
                            {myRsvp?.checkInToken && (
                                <div className="pt-4 border-t border-dark-500 mt-6">
                                    <p className="text-xs text-gray-400 mb-1">Your Check-In Token:</p>
                                    <code className="block text-sm font-mono bg-dark-600 rounded-lg px-3 py-2 break-all text-primary-300 select-all border border-dark-500 text-center">
                                        {myRsvp.checkInToken}
                                    </code>
                                    {myRsvp.checkedIn
                                        ? <p className="text-sm font-medium text-emerald-400 mt-2 flex items-center justify-center gap-1.5"><CheckCircle size={14} /> Checked in successfully</p>
                                        : <p className="text-xs text-gray-500 mt-2 text-center">Present this token at the event entrance</p>
                                    }
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Modal */}
            {isRegisterModalOpen && (
                <RegistrationModal
                    event={event}
                    onClose={() => setIsRegisterModalOpen(false)}
                    onSubmit={handleRSVP}
                    submitting={submitting}
                    initialTicket={selectedTicket}
                    rsvpStatusOptions={RSVP_OPTIONS}
                />
            )}
        </div>
    );
};

export default EventDetail;
