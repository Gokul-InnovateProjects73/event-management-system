import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, adminAPI } from '../../api/api';
import { format } from 'date-fns';
import { Plus, Trash2, Users, ArrowRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [rsvpCounts, setRsvpCounts] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const res = await eventAPI.getMyEvents();
            setEvents(res.data);
            // Load RSVP counts for each event
            const counts = {};
            await Promise.all(res.data.map(async (ev) => {
                try {
                    const r = await adminAPI.getEventRSVPs(ev._id);
                    counts[ev._id] = r.data.length;
                } catch { counts[ev._id] = 0; }
            }));
            setRsvpCounts(counts);
        } catch {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await eventAPI.delete(id);
            toast.success('Event deleted');
            setEvents(prev => prev.filter(e => e._id !== id));
        } catch {
            toast.error('Failed to delete event');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                    <Calendar size={28} className="text-primary-400" /> My Events
                </h1>
                <button onClick={() => navigate('/admin/events/create')} className="btn-primary">
                    <Plus size={18} /> Create Event
                </button>
            </div>

            {events.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-black mb-2">No events yet</h2>
                    <p className="text-gray-400 mb-6">Create your first event to get started</p>
                    <button onClick={() => navigate('/admin/events/create')} className="btn-primary mx-auto">
                        <Plus size={18} /> Create Event
                    </button>
                </div>
            ) : (
                <div className="card overflow-hidden !p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-dark-500 bg-dark-600">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">RSVPs</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-600">
                            {events.map((ev) => (
                                <tr key={ev._id} className="hover:bg-dark-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white truncate max-w-[200px]">{ev.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 sm:hidden">{format(new Date(ev.date), 'MMM d, yyyy')}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 hidden sm:table-cell whitespace-nowrap">
                                        {format(new Date(ev.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="badge bg-primary-500/20 text-primary-400 capitalize text-xs">{ev.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigate(`/admin/events/${ev._id}/rsvps`)}
                                            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 mx-auto transition-colors"
                                        >
                                            <Users size={14} />
                                            <span className="font-medium">{rsvpCounts[ev._id] ?? 0}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`badge text-xs capitalize ${ev.status === 'published' ? 'bg-green-500/20 text-green-400' : ev.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {ev.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/events/${ev._id}/rsvps`)}
                                                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                                            >
                                                RSVPs <ArrowRight size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ev._id, ev.title)}
                                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
