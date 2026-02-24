import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../api/api';
import { format } from 'date-fns';
import { Search, Calendar, MapPin, Users, Filter } from 'lucide-react';
import CategoryBadge from '../components/CategoryBadge';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'conference', 'workshop', 'social', 'sports', 'music', 'other'];

const EventCard = ({ event, onClick }) => (
    <div
        onClick={() => onClick(event._id)}
        className="card cursor-pointer hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
        {/* Color banner */}
        <div className="h-2 rounded-t-xl -mx-6 -mt-6 mb-4 bg-gradient-to-r from-primary-600 to-violet-600" />
        <div className="flex items-start justify-between gap-2 mb-3">
            <CategoryBadge category={event.category} />
            <span className="text-xs text-gray-500 whitespace-nowrap">
                {format(new Date(event.date), 'MMM d')}
            </span>
        </div>
        <h3 className="font-semibold text-white mb-2 line-clamp-2 flex-1">{event.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{event.description}</p>
        <div className="space-y-1.5 mt-auto">
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} className="text-primary-400" />
                {format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={12} className="text-primary-400" />
                <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users size={12} className="text-primary-400" />
                Capacity: {event.capacity}
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-dark-500 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-[10px] text-white font-bold">
                {event.organizer?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">{event.organizer?.name}</span>
        </div>
    </div>
);

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await eventAPI.getAll({ search, category });
                setEvents(res.data);
            } catch {
                toast.error('Failed to load events');
            } finally {
                setLoading(false);
            }
        };
        const delay = setTimeout(fetchEvents, 300);
        return () => clearTimeout(delay);
    }, [search, category]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Explore Events</h1>
                    <p className="text-gray-400 mt-1">{events.length} events available</p>
                </div>
                <button onClick={() => navigate('/create-event')} className="btn-primary">
                    + Create Event
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        id="event-search"
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="relative">
                    <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <select
                        id="category-filter"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field pl-10 pr-8 capitalize appearance-none cursor-pointer min-w-[160px]"
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c} className="capitalize bg-dark-700">
                                {c === 'all' ? 'All Categories' : c}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                    <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize border ${category === c
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : 'border-dark-500 text-gray-400 hover:border-primary-500 hover:text-primary-400'
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Event Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-2 bg-dark-500 rounded mb-4" />
                            <div className="h-4 bg-dark-500 rounded w-1/3 mb-3" />
                            <div className="h-5 bg-dark-500 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-dark-500 rounded w-full mb-1" />
                            <div className="h-4 bg-dark-500 rounded w-5/6" />
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20">
                    <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No events found</p>
                    <p className="text-gray-600 text-sm mt-1">Try changing your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard key={event._id} event={event} onClick={(id) => navigate(`/events/${id}`)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
