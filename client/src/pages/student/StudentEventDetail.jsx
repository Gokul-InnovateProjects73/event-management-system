import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, rsvpAPI } from '../../api/api';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Clock, ArrowLeft, CheckCircle, HelpCircle, XCircle, Globe, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// Live countdown
const useCountdown = (targetDate) => {
    const calc = useCallback(() => {
        const diff = new Date(targetDate) - new Date();
        if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, over: true };
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            mins: Math.floor((diff % 3600000) / 60000),
            secs: Math.floor((diff % 60000) / 1000),
            over: false,
        };
    }, [targetDate]);
    const [time, setTime] = useState(calc);
    useEffect(() => {
        const id = setInterval(() => setTime(calc()), 1000);
        return () => clearInterval(id);
    }, [calc]);
    return time;
};

const statuses = [
    { value: 'attending', label: '✓ Register Now', icon: CheckCircle, cls: 'border-emerald-500 bg-white dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/10' },
    { value: 'maybe', label: '? I\'m Interested', icon: HelpCircle, cls: 'border-amber-500 bg-white dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/10' },
    { value: 'not_attending', label: '✗ Not Interested', icon: XCircle, cls: 'border-red-500 bg-white dark:bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm shadow-red-500/10' },
];

const StudentEventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [myRSVP, setMyRSVP] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('attending');
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // Registration Form States
    const [showRegForm, setShowRegForm] = useState(false);
    const [regData, setRegData] = useState({
        fullName: '',
        department: '',
        rollNumber: '',
        college: 'Sri Krishna College of Technology'
    });

    // Populate default info when user is available
    useEffect(() => {
        if (user) {
            setRegData(prev => ({
                ...prev,
                fullName: prev.fullName || user.name || '',
                department: prev.department || user.department || '',
                rollNumber: prev.rollNumber || user.rollNumber || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        const load = async () => {
            try {
                const [evRes, rsvpRes] = await Promise.all([
                    eventAPI.getById(id),
                    rsvpAPI.getMyRSVPEvents(),
                ]);
                setEvent(evRes.data);
                const mine = rsvpRes.data.find(r => r.event?._id === id || r.event === id);
                if (mine) { setMyRSVP(mine); setSelectedStatus(mine.status); }
            } catch {
                toast.error('Failed to load event');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const countdown = useCountdown(event?.date || new Date());

    const handleRSVPClick = () => {
        if (selectedStatus === 'attending') {
            setShowRegForm(true); // Open the registration form
        } else {
            handleFormSubmit(); // Submit directly for 'maybe' or 'not_attending'
        }
    };

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        setRsvpLoading(true);
        try {
            const payload = { eventId: id, status: selectedStatus };
            if (selectedStatus === 'attending') {
                payload.personalInfo = { fullName: regData.fullName, studentId: regData.rollNumber };
                payload.academicInfo = { department: regData.department, college: regData.college };
            }
            await rsvpAPI.submit(payload);
            toast.success(myRSVP ? 'Registration updated!' : 'Successfully registered! 🎉');
            setMyRSVP({ status: selectedStatus });
            setShowRegForm(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit registration');
        } finally {
            setRsvpLoading(false);
        }
    };

    const handleChange = (e) => {
        setRegData({ ...regData, [e.target.name]: e.target.value });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!event) return null;

    const isPast = new Date(event.date) < new Date();

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in relative">
            <button onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-stone-500 hover:text-emerald-600 mb-8 transition-colors font-semibold text-sm">
                <ArrowLeft size={18} className="group-hover:-transtone-x-1 transition-transform" /> Back to Dashboard
            </button>

            {/* Banner */}
            {event.imageUrl
                ? <img src={event.imageUrl} alt={event.title} className="w-full h-72 sm:h-96 object-cover rounded-2xl mb-10 shadow-lg border border-stone-100 dark:border-stone-800" />
                : <div className="w-full h-56 rounded-2xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center mb-10 border border-dashed border-stone-200 dark:border-stone-700">
                    <Calendar size={64} className="text-stone-200 dark:text-stone-600" />
                </div>
            }

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main info */}
                <div className="flex-1 space-y-8">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">{event.category}</span>
                            {isPast && <span className="badge border border-stone-200 bg-stone-100 text-stone-500 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-400">Past Event</span>}
                            {event.tags?.map(t => (
                                <span key={t} className="badge border border-stone-100 bg-stone-50 text-stone-400 dark:bg-stone-800 dark:border-stone-700 uppercase tracking-tight">#{t}</span>
                            ))}
                        </div>
                        <h1 className="text-4xl font-extrabold text-black tracking-tight leading-tight">{event.title}</h1>
                    </div>

                    {/* Details Card */}
                    <div className="card !p-0 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 border-stone-200 dark:border-stone-800">
                        <div className="flex items-center gap-4 p-5 hover:bg-emerald-50/20 dark:hover:bg-emerald-500/5 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 shadow-inner">
                                <Calendar size={20} className="text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-black uppercase tracking-widest">Date & Time</p>
                                <p className="text-[15px] font-black text-black uppercase tracking-tight">
                                    {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}{event.time ? ` · ${event.time}` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 hover:bg-amber-50/20 dark:hover:bg-amber-500/5 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 shadow-inner">
                                <MapPin size={20} className="text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-black uppercase tracking-widest">Location</p>
                                <p className="text-[15px] font-black text-black uppercase tracking-tight">{event.location}</p>
                            </div>
                        </div>
                        {event.capacity && (
                            <div className="flex items-center gap-4 p-5 hover:bg-violet-50/20 dark:hover:bg-violet-500/5 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0 shadow-inner">
                                    <Users size={20} className="text-violet-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-black uppercase tracking-widest">Capacity</p>
                                    <p className="text-[15px] font-black text-black uppercase tracking-tight">{event.capacity} seats reserved</p>
                                </div>
                            </div>
                        )}
                        {event.virtualLink && (
                            <div className="flex items-center gap-4 p-5 bg-emerald-50/30 dark:bg-emerald-500/5">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0 shadow-inner">
                                    <Globe size={20} className="text-teal-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Virtual Event</p>
                                    <a href={event.virtualLink} target="_blank" rel="noreferrer"
                                        className="text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest">
                                        Join Meeting Link <ArrowLeft size={14} className="inline rotate-180 ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-bold text-black mb-4 tracking-tight">About the Event</h2>
                        <p className="text-black leading-relaxed whitespace-pre-line text-base">{event.description}</p>
                    </div>

                    {/* Agenda */}
                    {event.agenda?.filter(a => a.title).length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-5 flex items-center gap-2 tracking-tight">
                                <Clock size={22} className="text-emerald-600" /> Event Agenda
                            </h2>
                            <div className="space-y-4">
                                {event.agenda.filter(a => a.title).map((a, i) => (
                                    <div key={i} className="flex gap-5 p-5 bg-white dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm border-l-4 border-l-emerald-500">
                                        {a.time && <span className="text-sm text-emerald-600 font-bold shrink-0">{a.time}</span>}
                                        <div>
                                            <p className="text-[15px] font-bold text-stone-900 dark:text-white leading-snug">{a.title}</p>
                                            {a.description && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">{a.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar — Countdown + RSVP */}
                <div className="lg:w-80 space-y-6 shrink-0">
                    {/* Countdown */}
                    {!isPast && (
                        <div className="card !p-8 text-center shadow-2xl border-emerald-100 bg-emerald-50/20 dark:bg-stone-900 dark:border-emerald-500/20">
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-6">Starting In</p>
                            <div className="flex justify-center gap-3">
                                {[
                                    { v: countdown.days, l: 'Days' },
                                    { v: countdown.hours, l: 'Hrs' },
                                    { v: countdown.mins, l: 'Min' },
                                    { v: countdown.secs, l: 'Sec' },
                                ].map(({ v, l }) => (
                                    <div key={l} className="flex flex-col items-center">
                                        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl px-3 py-4 font-black text-3xl text-emerald-600 dark:text-emerald-400 min-w-[60px] shadow-sm">
                                            {String(v).padStart(2, '0')}
                                        </div>
                                        <p className="text-[9px] font-black text-stone-400 mt-3 uppercase tracking-widest">{l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RSVP Panel */}
                    {!isPast && (
                        <div className="card !p-8 space-y-6 border-amber-100 bg-amber-50/10 dark:bg-stone-900 dark:border-amber-500/10 shadow-xl">
                            <h3 className="font-black text-stone-900 dark:text-white text-xl tracking-tighter uppercase">
                                {myRSVP ? 'Update Entry' : 'Reserved Entry'}
                            </h3>
                            <div className="space-y-3">
                                {statuses.map(({ value, label, cls }) => (
                                    <button key={value} type="button"
                                        onClick={() => setSelectedStatus(value)}
                                        className={`w-full py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${selectedStatus === value ? cls : 'border-stone-200 text-stone-500 bg-white hover:border-emerald-300 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleRSVPClick} disabled={rsvpLoading} 
                                className="btn-primary w-full !py-5 shadow-xl shadow-emerald-600/20 rounded-2xl text-[11px] uppercase tracking-[0.2em] font-black">
                                {rsvpLoading
                                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : myRSVP ? 'Confirm Update' : 'Claim Seat Now'
                                }
                            </button>
                            {myRSVP && (
                                <p className="text-[10px] text-center font-black text-stone-400 uppercase tracking-[0.2em]">
                                    Current: <span className="text-amber-600 dark:text-amber-400">{myRSVP.status?.replace('_', ' ')}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {isPast && (
                        <div className="card !p-8 text-center bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                            <XCircle size={32} className="text-stone-300 mx-auto mb-3" />
                            <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">This event has concluded</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Form Modal */}
            {showRegForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-lg p-8 animate-fade-in shadow-2xl border border-stone-200 dark:border-stone-800">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Complete Registration</h2>
                                <p className="text-sm font-medium text-stone-500 mt-1">Please confirm your details to reserve your seat</p>
                            </div>
                            <button onClick={() => setShowRegForm(false)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-2 bg-stone-50 dark:bg-stone-800 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input required type="text" name="fullName" value={regData.fullName} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" placeholder="John Doe" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Register Number</label>
                                    <input required type="text" name="rollNumber" value={regData.rollNumber} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" placeholder="e.g. 21CS01" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                                    <input required type="text" name="department" value={regData.department} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" placeholder="e.g. CSE" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[11px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 ml-1">College Name</label>
                                <input required type="text" name="college" value={regData.college} onChange={handleChange} className="w-full px-5 py-3.5 rounded-2xl border-2 border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 text-stone-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium" placeholder="College Name" />
                            </div>

                            <div className="pt-6 mt-4 border-t-2 border-dashed border-stone-100 dark:border-stone-800">
                                <button type="submit" disabled={rsvpLoading} className="w-full btn-primary py-4 shadow-xl shadow-emerald-500/30 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex justify-center items-center active:scale-[0.98] transition-all">
                                    {rsvpLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Confirm Registration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentEventDetail;
