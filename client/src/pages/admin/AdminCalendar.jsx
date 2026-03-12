import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { eventAPI } from '../../api/api';
import { format, isSameDay } from 'date-fns';
import { Calendar as CalIcon, MapPin, X, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import 'react-calendar/dist/Calendar.css';

const AdminCalendar = () => {
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
            } catch (error) {
                console.error(error);
                toast.error('Failed to load events');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8 border-b border-dark-600 pb-6">
                <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg">
                        <CalIcon size={20} className="text-white" />
                    </div>
                    Event Calendar
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Click on highlighted dates to view scheduled events and manage registrations.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Calendar Area */}
                    <div className="flex-1">
                        <div className="glass-card p-4 sm:p-6 lg:p-8 shadow-xl">
                            <style>{`
                                .react-calendar {
                                    width: 100%;
                                    background: transparent;
                                    border: none;
                                    font-family: inherit;
                                    color: rgb(var(--color-text));
                                }
                                .react-calendar__navigation {
                                    margin-bottom: 2rem;
                                }
                                .react-calendar__navigation button {
                                    color: rgb(var(--color-text));
                                    background: transparent;
                                    font-size: 1.125rem;
                                    font-weight: 700;
                                    padding: 12px;
                                    border-radius: 12px;
                                    min-width: 48px;
                                    transition: background-color 0.2s;
                                }
                                .react-calendar__navigation button:hover,
                                .react-calendar__navigation button:focus {
                                    background: rgba(var(--color-primary), 0.1);
                                }
                                .react-calendar__month-view__weekdays {
                                    color: rgb(var(--color-text-muted));
                                    font-size: 0.8rem;
                                    text-transform: uppercase;
                                    letter-spacing: 0.1em;
                                    font-weight: 700;
                                    margin-bottom: 1rem;
                                }
                                .react-calendar__month-view__weekdays abbr {
                                    text-decoration: none;
                                }
                                .react-calendar__tile {
                                    background: transparent;
                                    color: rgb(var(--color-text));
                                    border-radius: 12px;
                                    padding: 14px 4px;
                                    font-size: 0.95rem;
                                    font-weight: 500;
                                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                                }
                                .react-calendar__tile:hover,
                                .react-calendar__tile:focus {
                                    background: rgba(var(--color-primary), 0.1) !important;
                                    color: rgb(var(--color-primary));
                                    transform: scale(1.05);
                                }
                                .react-calendar__tile--now {
                                    background: rgba(var(--color-primary), 0.15) !important;
                                    color: rgb(var(--color-primary)) !important;
                                    font-weight: 800;
                                    border: 2px solid rgba(var(--color-primary), 0.3);
                                }
                                .react-calendar__tile--active,
                                .react-calendar__tile--hasActive {
                                    background: rgb(var(--color-primary)) !important;
                                    color: #fff !important;
                                    box-shadow: 0 4px 14px 0 rgba(var(--color-primary), 0.39);
                                    transform: scale(1.05);
                                }
                                .react-calendar__tile.has-events {
                                    background: rgba(var(--color-primary), 0.05);
                                    font-weight: 700;
                                }
                                .react-calendar__month-view__days__day--neighboringMonth {
                                    color: rgba(var(--color-text-muted), 0.4);
                                }
                                .react-calendar__navigation__label {
                                    font-size: 1.25rem !important;
                                    letter-spacing: -0.02em;
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
                        <div className="flex items-center gap-2 mt-4 px-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                            <span className="text-sm font-medium text-gray-500">Event scheduled on this date</span>
                        </div>
                    </div>

                    {/* Side Panel */}
                    <div className="lg:w-[350px] shrink-0">
                        {panelOpen && selectedDate && selectedEvents.length > 0 ? (
                            <div className="glass-card shadow-2xl h-fit animate-fade-in border border-primary-500/20">
                                <div className="flex items-center justify-between p-5 border-b border-dark-600 bg-primary-500/5 rounded-t-2xl">
                                    <div>
                                        <h3 className="font-bold text-black text-base flex items-center gap-2">
                                            <CalIcon size={16} className="text-primary-500" />
                                            {format(selectedDate, 'MMM d, yyyy')}
                                        </h3>
                                        <p className="text-xs text-primary-600 mt-1 font-medium">{selectedEvents.length} Event{selectedEvents.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <button onClick={() => setPanelOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-black hover:bg-gray-100 transition-colors shadow-sm">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
                                    {selectedEvents.map(ev => (
                                        <div key={ev._id} className="group p-4 bg-white rounded-xl cursor-default transition-all border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-violet-500" />
                                            <div className="pl-2">
                                                <p className="font-bold text-black text-sm tracking-tight mb-2 pr-6">{ev.title}</p>
                                                
                                                <div className="space-y-1.5 mb-4">
                                                    {ev.time && (
                                                        <p className="flex items-center gap-2 text-xs font-semibold text-primary-600">
                                                            <Clock size={12} className="text-primary-400" /> {ev.time}
                                                        </p>
                                                    )}
                                                    <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                        <MapPin size={12} className="text-gray-400" /> {ev.location}
                                                    </p>
                                                    <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-600 mt-1">
                                                        {ev.category}
                                                    </span>
                                                </div>

                                                <button onClick={() => navigate(`/admin/events/${ev._id}/rsvps`)}
                                                    className="w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                                                    <Users size={14} /> Manage RSVPs
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-8 text-center h-full min-h-[400px] flex flex-col items-center justify-center border-dashed border-2 border-dark-600">
                                <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4">
                                    <CalIcon size={32} className="text-gray-500" />
                                </div>
                                <h3 className="text-black font-bold text-lg mb-2">No Date Selected</h3>
                                <p className="text-gray-500 text-sm font-medium px-4">Click a highlighted calendar date to see registered events and manage RSVPs.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;
