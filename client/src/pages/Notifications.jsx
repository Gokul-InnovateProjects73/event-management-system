import { useState, useEffect } from 'react';
import { notificationAPI } from '../api/api';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TYPE_STYLES = {
    rsvp: 'bg-primary-500/20 text-primary-400',
    event: 'bg-violet-500/20 text-violet-400',
    checkin: 'bg-emerald-500/20 text-emerald-400',
    system: 'bg-gray-500/20 text-gray-400',
};

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data);
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleMarkRead = async (id) => {
        await notificationAPI.markRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    };

    const handleMarkAllRead = async () => {
        await notificationAPI.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All marked as read');
    };

    const handleClick = (n) => {
        if (!n.read) handleMarkRead(n._id);
        if (n.link) navigate(n.link);
    };

    const unread = notifications.filter(n => !n.read).length;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Bell size={28} className="text-primary-400" /> Notifications
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unread > 0 && (
                    <button onClick={handleMarkAllRead} className="btn-secondary text-sm">
                        <CheckCheck size={16} /> Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="card text-center py-16">
                    <Bell size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            onClick={() => handleClick(n)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${n.read
                                    ? 'bg-dark-700 border-dark-500 opacity-70'
                                    : 'bg-dark-600 border-primary-500/30 shadow-lg shadow-primary-500/5'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                                    <div className="flex-1">
                                        <p className={`text-sm ${n.read ? 'text-gray-400' : 'text-white font-medium'}`}>{n.message}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`badge text-xs ${TYPE_STYLES[n.type] || TYPE_STYLES.system}`}>{n.type}</span>
                                            <span className="text-xs text-gray-500">
                                                {n.createdAt ? format(new Date(n.createdAt), 'MMM d • h:mm a') : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {n.link && <ExternalLink size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
