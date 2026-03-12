import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { eventAPI } from '../../api/api';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalIcon, MapPin, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';

const StudentCalendar = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [panelOpen, setPanelOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await eventAPI.getAll({ limit: 200 });
                setEvents(res.data);
            } catch {
                toast.error('Failed to load events');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const eventDates = events.map(e => new Date(e.date));

    const eventsOnDate = (date) => events.filter(e => isSameDay(new Date(e.date), date));

    const handleDayClick = (date) => {
        setSelectedDate(date);
        const dayEvents = eventsOnDate(date);
        if (dayEvents.length > 0) setPanelOpen(true);
    };

    const tileContent = ({ date, view }) => {
        if (view !== 'month') return null;
        const count = eventsOnDate(date).length;
        if (count === 0) return null;
        return (
            <div className="flex justify-center gap-0.5 mt-0.5">
                {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary-400 block" />
                ))}
            </div>
        );
    };

    const tileClassName = ({ date, view }) => {
        if (view !== 'month') return '';
        if (eventsOnDate(date).length > 0) return 'has-events';
        return '';
    };

    const selectedEvents = selectedDate ? eventsOnDate(selectedDate) : [];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                    <CalIcon size={28} className="text-primary-400" /> Event Calendar
                </h1>
                <p className="text-gray-400 mt-1">Click on highlighted dates to view events</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Calendar */}
                    <div className="flex-1">
                        <div className="glass-card p-4 sm:p-6">
                            <style>{`
                                .react-calendar {
                                    width: 100%;
                                    background: transparent;
                                    border: none;
                                    font-family: inherit;
                                    color: rgb(var(--color-text));
                                }
                                .react-calendar__navigation button {
                                    color: rgb(var(--color-text));
                                    background: transparent;
                                    font-size: 1rem;
                                    font-weight: 600;
                                    padding: 8px;
                                    border-radius: 10px;
                                    min-width: 44px;
                                }
                                .react-calendar__navigation button:hover,
                                .react-calendar__navigation button:focus {
                                    background: rgba(var(--color-primary), 0.1);
                                }
                                .react-calendar__month-view__weekdays {
                                    color: rgb(var(--color-text-muted));
                                    font-size: 0.75rem;
                                    text-transform: uppercase;
                                    letter-spacing: 0.05em;
                                    font-weight: 600;
                                }
                                .react-calendar__month-view__weekdays abbr {
                                    text-decoration: none;
                                }
                                .react-calendar__tile {
                                    background: transparent;
                                    color: rgb(var(--color-text));
                                    border-radius: 10px;
                                    padding: 10px 4px;
                                    font-size: 0.875rem;
                                    transition: all 0.15s;
                                }
                                .react-calendar__tile:hover,
                                .react-calendar__tile:focus {
                                    background: rgba(var(--color-primary), 0.1) !important;
                                    color: rgb(var(--color-primary));
                                }
                                .react-calendar__tile--now {
                                    background: rgba(var(--color-primary), 0.15) !important;
                                    color: rgb(var(--color-primary)) !important;
                                    font-weight: 700;
                                }
                                .react-calendar__tile--active,
                                .react-calendar__tile--hasActive {
                                    background: rgba(var(--color-primary), 0.8) !important;
                                    color: #fff !important;
                                }
                                .react-calendar__tile.has-events {
                                    background: rgba(var(--color-primary), 0.05);
                                }
                                .react-calendar__month-view__days__day--neighboringMonth {
                                    color: rgba(var(--color-text-muted), 0.4);
                                }
                                .react-calendar__navigation__label {
                                    font-size: 1.1rem !important;
                                    letter-spacing: -0.01em;
                                }
                            `}</style>
                            <Calendar
                                onClickDay={handleDayClick}
                                tileContent={tileContent}
                                tileClassName={tileClassName}
                                value={selectedDate}
                            />
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-2 mt-3 px-2">
                            <span className="w-2 h-2 rounded-full bg-primary-400" />
                            <span className="text-xs text-gray-400">Event scheduled on this date</span>
                        </div>
                    </div>

                    {/* Side panel — upcoming events list */}
                    <div className="lg:w-72">
                        {panelOpen && selectedDate && selectedEvents.length > 0 ? (
                            <div className="glass-card h-fit animate-fade-in">
                                <div className="flex items-center justify-between p-4 border-b border-dark-600">
                                    <h3 className="font-semibold text-white text-sm">
                                        {format(selectedDate, 'MMMM d, yyyy')}
                                    </h3>
                                    <button onClick={() => setPanelOpen(false)} className="text-gray-400 hover:text-white">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    {selectedEvents.map(ev => (
                                        <div key={ev._id}
                                            onClick={() => navigate(`/student/events/${ev._id}`)}
                                            className="p-3 bg-dark-700 rounded-xl cursor-pointer hover:bg-dark-600 transition-colors border border-dark-600 hover:border-primary-500/30">
                                            <p className="font-medium text-white text-sm line-clamp-1 mb-1.5">{ev.title}</p>
                                            {ev.time && (
                                                <p className="flex items-center gap-1.5 text-xs text-primary-400 mb-1">
                                                    <Clock size={11} /> {ev.time}
                                                </p>
                                            )}
                                            <p className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                                                <MapPin size={11} className="text-emerald-400" /> {ev.location}
                                            </p>
                                            <span className="badge bg-primary-500/20 text-primary-400 capitalize text-xs mt-2">{ev.category}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-6 text-center h-fit">
                                <CalIcon size={36} className="text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Click a highlighted date to see events</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCalendar;
