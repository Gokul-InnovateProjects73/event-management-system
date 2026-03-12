import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, rsvpAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { Calendar, MapPin, Clock, Bookmark, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Live countdown hook
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

const CountdownPill = ({ date }) => {
    const t = useCountdown(date);
    if (t.over) return <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Ended</span>;
    return (
        <div className="flex items-center gap-1.5 font-black uppercase tracking-widest">
            {[
                { v: t.days, l: 'd' },
                { v: t.hours, l: 'h' },
                { v: t.mins, l: 'm' },
                { v: t.secs, l: 's' },
            ].map(({ v, l }) => (
                <span key={l} className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-emerald-600 dark:text-emerald-400 shadow-sm text-[10px]">
                    {String(v).padStart(2, '0')}<span className="text-stone-400 ml-1 text-[8px]">{l}</span>
                </span>
            ))}
        </div>
    );
};

const StudentDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [upcoming, setUpcoming] = useState([]);
    const [myRSVPs, setMyRSVPs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [evRes, rsvpRes] = await Promise.all([
                    eventAPI.getAll({ limit: 6 }),
                    rsvpAPI.getMyRSVPEvents(),
                ]);
                const now = new Date();
                setUpcoming(evRes.data.filter(e => new Date(e.date) > now).slice(0, 6));
                setMyRSVPs(rsvpRes.data.filter(r => r.event && new Date(r.event.date) > now).slice(0, 4));
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
            {/* Premium Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Campus Pulse Active</span>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
                                Hello, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent uppercase">{user?.name?.split(' ')[0]}!</span> <span className="inline-block animate-bounce">👋</span>
                            </h1>
                            <p className="text-stone-400 text-lg sm:text-xl font-medium max-w-lg mx-auto md:mx-0">
                                Discover premium events in <span className="text-white font-bold uppercase">{user?.department}</span>.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-[10px] font-black uppercase tracking-widest text-stone-300">
                            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                ID: <span className="text-emerald-400 ml-1">{user?.rollNumber}</span>
                            </div>
                            <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                DEPT: <span className="text-amber-400 ml-1">{user?.department}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Upcoming Events Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-5">
                    <h2 className="text-3xl font-black text-black tracking-tighter uppercase flex items-center gap-4">
                        <span className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                            <Clock size={24} />
                        </span>
                        Upcoming Events
                    </h2>
                    <button onClick={() => navigate('/student/events')}
                        className="group flex items-center gap-2 text-stone-500 hover:text-emerald-600 font-black uppercase tracking-[0.2em] text-[11px] transition-all">
                        View All <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                {upcoming.length === 0 ? (
                    <div className="card !p-20 text-center text-stone-400 font-black uppercase tracking-widest bg-stone-50/50 border-dashed">No upcoming events yet</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcoming.map((ev) => (
                            <div key={ev._id}
                                onClick={() => navigate(`/student/events/${ev._id}`)}
                                className="card group cursor-pointer hover:border-emerald-500 hover:ring-8 hover:ring-emerald-500/5 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col gap-6">
                                {ev.imageUrl
                                    ? <img src={ev.imageUrl} alt={ev.title} className="w-full h-44 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105" />
                                    : <div className="w-full h-44 rounded-xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center border border-dashed border-stone-200 dark:border-stone-700 group-hover:bg-emerald-50/50 transition-colors"><Calendar size={48} className="text-stone-300 dark:text-stone-600" /></div>
                                }
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="badge border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">{ev.category}</span>
                                        <span className="badge border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 uppercase tracking-tighter">Live</span>
                                    </div>
                                    <h3 className="text-xl font-black text-stone-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-tight leading-tight line-clamp-2">
                                        {ev.title}
                                    </h3>
                                    <div className="flex flex-col gap-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
                                        <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 text-[12px] font-black uppercase tracking-widest">
                                            <Calendar size={15} className="text-emerald-500" />
                                            {format(new Date(ev.date), 'MMM d, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-3 text-stone-500 dark:text-stone-400 text-[12px] font-black uppercase tracking-widest truncate">
                                            <MapPin size={15} className="text-amber-500" />
                                            {ev.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Launch in</span>
                                    <CountdownPill date={ev.date} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* My Registrations Section */}
            {myRSVPs.length > 0 && (
                <section className="space-y-8">
                    <h2 className="text-3xl font-black text-black tracking-tighter uppercase flex items-center gap-4">
                        <span className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                            <Bookmark size={24} />
                        </span>
                        My Registrations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {myRSVPs.map((r) => {
                            const ev = r.event;
                            return (
                                <div key={r._id}
                                    onClick={() => navigate(`/student/events/${ev._id}`)}
                                    className="card group cursor-pointer hover:border-emerald-500 flex items-center gap-6 p-6">
                                    {ev.imageUrl
                                        ? <img src={ev.imageUrl} alt={ev.title} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 transition-transform group-hover:scale-105" />
                                        : <div className="w-24 h-24 rounded-2xl bg-stone-50 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 border border-dashed border-stone-200 dark:border-stone-700 group-hover:bg-emerald-50/50 transition-colors"><Calendar size={28} className="text-stone-300 dark:text-stone-600" /></div>
                                    }
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <p className="font-black text-stone-900 dark:text-white text-lg truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight leading-none">{ev.title}</p>
                                        <p className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">{format(new Date(ev.date), 'MMM d, yyyy')}</p>
                                        <div className="pt-2">
                                            <span className={`badge border ${r.status === 'attending' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                                : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'}`}>
                                                {r.status === 'attending' ? '✓ Registered' : '? Interest'}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-stone-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-2" />
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default StudentDashboard;
