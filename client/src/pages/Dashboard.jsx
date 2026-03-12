import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { eventAPI, rsvpAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Users, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales: { 'en-US': enUS },
});

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="card flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-black">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [rsvpEvents, setRsvpEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calendarDate, setCalendarDate] = useState(new Date());

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [evRes, myEvRes, rsvpRes] = await Promise.all([
                    eventAPI.getAll(),
                    eventAPI.getMyEvents(),
                    rsvpAPI.getMyRSVPEvents(),
                ]);
                setEvents(evRes.data);
                setMyEvents(myEvRes.data);
                setRsvpEvents(rsvpRes.data);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Convert events to calendar format
    const calendarEvents = events.map((ev) => ({
        id: ev._id,
        title: ev.title,
        start: new Date(ev.date),
        end: ev.endDate ? new Date(ev.endDate) : new Date(ev.date),
        resource: ev,
    }));

    const handleSelectEvent = (calEv) => navigate(`/events/${calEv.id}`);

    const upcomingEvents = events
        .filter((e) => new Date(e.date) >= new Date())
        .slice(0, 4);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Hey, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-400 mt-1">Here's what's happening with your events</p>
                </div>
                <button onClick={() => navigate('/create-event')} className="btn-primary">
                    <Plus size={18} /> New Event
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Calendar} label="Total Events" value={events.length} color="bg-primary-600" />
                <StatCard icon={Star} label="My Events" value={myEvents.length} color="bg-violet-600" />
                <StatCard icon={Users} label="RSVPs Done" value={rsvpEvents.length} color="bg-emerald-600" />
                <StatCard icon={TrendingUp} label="Upcoming" value={upcomingEvents.length} color="bg-primary-700" />
            </div>

            {/* Upcoming Events (Moved up) */}
            {upcomingEvents.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title flex items-center gap-2 text-black">
                            <TrendingUp size={22} className="text-primary-400" /> Upcoming Events
                        </h2>
                        <button onClick={() => navigate('/events')} className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                            View all →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {upcomingEvents.map((ev) => {
                            const isRegistered = rsvpEvents.some(r => r.event._id === ev._id && r.status === 'attending');

                            return (
                                <div
                                    key={ev._id}
                                    className="card hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-200 flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="badge capitalize bg-primary-500/20 text-primary-400">{ev.category}</span>
                                        {isRegistered && <span className="badge bg-emerald-500/20 text-emerald-400">Registered ✅</span>}
                                    </div>
                                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/events/${ev._id}`)}>
                                        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">{ev.title}</h3>
                                        <p className="text-xs text-gray-500">{format(new Date(ev.date), 'MMM d, yyyy • h:mm a')}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate">📍 {ev.location}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-dark-600">
                                        <button
                                            onClick={() => navigate(`/events/${ev._id}`)}
                                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${isRegistered ? 'bg-dark-600 text-white hover:bg-dark-500' : 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/30'
                                                }`}
                                        >
                                            {isRegistered ? 'View Details' : 'Register Now'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* My Registered Events */}
            {rsvpEvents.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title flex items-center gap-2 text-black">
                            <Star size={22} className="text-violet-400" /> My Registered Events
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rsvpEvents.filter(r => r.status === 'attending').map((rsvp) => (
                            <div
                                key={rsvp._id}
                                onClick={() => navigate(`/events/${rsvp.event._id}`)}
                                className="card cursor-pointer border-l-4 border-l-violet-500 hover:bg-dark-700/50 transition-colors"
                            >
                                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{rsvp.event.title}</h3>
                                <p className="text-xs text-gray-400">{format(new Date(rsvp.event.date), 'MMM d, yyyy')}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs bg-dark-600 px-2 py-1 rounded text-primary-300 font-mono">{rsvp.checkInToken}</span>
                                    {rsvp.checkedIn ? (
                                        <span className="text-xs text-emerald-400">Checked In</span>
                                    ) : (
                                        <span className="text-xs text-yellow-400">Pending</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar */}
            <div>
                <div className="flex items-center justify-between mb-4 mt-4">
                    <h2 className="section-title flex items-center gap-2 text-black">
                        <Calendar size={22} className="text-primary-400" /> Event Calendar
                    </h2>
                </div>
                <div style={{ height: 480 }}>
                    <BigCalendar
                        localizer={localizer}
                        events={calendarEvents}
                        date={calendarDate}
                        onNavigate={setCalendarDate}
                        onSelectEvent={handleSelectEvent}
                        style={{ height: '100%' }}
                        popup
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
