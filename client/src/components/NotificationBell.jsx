import { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '../api/api';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const TYPE_DOT = {
    rsvp: 'bg-primary-400',
    event: 'bg-violet-400',
    checkin: 'bg-emerald-400',
    system: 'bg-gray-400',
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    const fetchUnread = async () => {
        try {
            const res = await notificationAPI.getUnreadCount();
            setUnread(res.data.count);
        } catch { /* silent */ }
    };

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getAll();
            setNotifications(res.data.slice(0, 8));
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleClick = async (n) => {
        setOpen(false);
        if (!n.read) {
            await notificationAPI.markRead(n._id);
            setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
            setUnread(prev => Math.max(0, prev - 1));
        }
        if (n.link) navigate(n.link);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
            >
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-700 border border-dark-400 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-dark-500 flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Notifications</p>
                        {unread > 0 && (
                            <button
                                onClick={async () => {
                                    await notificationAPI.markAllRead();
                                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                    setUnread(0);
                                }}
                                className="text-xs text-primary-400 hover:text-primary-300"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-dark-500">
                        {notifications.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm py-6">No notifications</p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => handleClick(n)}
                                    className={`px-4 py-3 cursor-pointer hover:bg-dark-600 transition-colors ${!n.read ? 'bg-dark-600/50' : ''}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!n.read ? TYPE_DOT[n.type] : 'bg-transparent'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs leading-snug ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.message}</p>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                                {n.createdAt ? format(new Date(n.createdAt), 'MMM d • h:mm a') : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="px-4 py-2 border-t border-dark-500">
                        <button onClick={() => { setOpen(false); navigate('/notifications'); }} className="text-xs text-primary-400 hover:text-primary-300 w-full text-center">
                            View all notifications →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
