import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../../api/api';
import { format } from 'date-fns';
import { Calendar, MapPin, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'conference', 'workshop', 'social', 'sports', 'music', 'other'];

const StudentEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await eventAPI.getAll({ limit: 100 });
                setEvents(res.data);
            } catch {
                toast.error('Failed to load events');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = events.filter(ev => {
        const matchCat = category === 'all' || ev.category === category;
        const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase()) || ev.location?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-extrabold text-black flex flex-col sm:flex-row items-center gap-3 tracking-tight">
                    <Calendar size={32} className="text-emerald-600" /> Browse Events
                </h1>
                <p className="text-stone-500 font-medium mt-2">Discover and register for upcoming events across all departments.</p>
            </div>

            {/* Search + Category filter */}
            <div className="flex flex-col lg:flex-row items-center gap-6 mb-10">
                <div className="relative w-full lg:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -transtone-y-1/2 text-stone-400" />
                    <input type="text" placeholder="Search by title or location..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field pl-12 shadow-sm" />
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${category === c
                                ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none'
                                : 'border-stone-200 text-stone-500 hover:border-emerald-400 hover:text-emerald-600 bg-white dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400'
                                }`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No events found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((ev) => {
                        const isPast = new Date(ev.date) < new Date();
                        return (
                            <div key={ev._id}
                                onClick={() => navigate(`/student/events/${ev._id}`)}
                                className={`card group cursor-pointer hover:border-emerald-400 hover:ring-4 hover:ring-emerald-500/5 flex flex-col gap-4 ${isPast ? 'opacity-70 grayscale-[0.5]' : ''}`}>

                                {ev.imageUrl
                                    ? <img src={ev.imageUrl} alt={ev.title} className="w-full h-40 object-cover rounded-lg" />
                                    : <div className="w-full h-32 rounded-lg bg-stone-50 dark:bg-stone-800 flex items-center justify-center border border-dashed border-stone-200 dark:border-stone-700">
                                        <Calendar size={40} className="text-stone-300" />
                                    </div>
                                }

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="badge border border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">{ev.category}</span>
                                    {isPast && <span className="badge border border-stone-200 bg-stone-100 text-stone-500 dark:bg-stone-700 dark:border-stone-600 dark:text-stone-400">Past</span>}
                                    {ev.time && <span className="badge border border-stone-100 bg-stone-50 text-stone-400 dark:bg-stone-800 dark:border-stone-700 uppercase tracking-tighter">{ev.time}</span>}
                                </div>

                                <p className="font-black text-stone-900 dark:text-white text-xl line-clamp-2 group-hover:text-emerald-600 transition-colors tracking-tight uppercase">{ev.title}</p>

                                <div className="space-y-2 mt-auto pt-2 border-t border-stone-100 dark:border-stone-800">
                                    <div className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                                        <Calendar size={14} className="text-emerald-500" />
                                        {format(new Date(ev.date), 'MMMM d, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 truncate">
                                        <MapPin size={14} className="text-amber-500" /> {ev.location}
                                    </div>
                                    {ev.capacity && (
                                        <div className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                                            <Users size={14} className="text-violet-500" /> {ev.capacity} Seats Left
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentEvents;
