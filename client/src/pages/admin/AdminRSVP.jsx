import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI, eventAPI } from '../../api/api';
import { format } from 'date-fns';
import { ArrowLeft, Users, CheckCircle, HelpCircle, XCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    attending: { badge: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
    maybe: { badge: 'bg-yellow-500/20 text-yellow-400', icon: HelpCircle },
    not_attending: { badge: 'bg-red-500/20 text-red-400', icon: XCircle },
};

const AdminRSVP = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDept, setFilterDept] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                const [evRes, rsvpRes] = await Promise.all([
                    eventAPI.getById(id),
                    adminAPI.getEventRSVPs(id),
                ]);
                setEvent(evRes.data);
                setRsvps(rsvpRes.data);
            } catch {
                toast.error('Failed to load RSVPs');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const getDept = (r) => r.academicInfo?.department || r.department || r.user?.department || 'Unknown';
    const depts = ['all', ...new Set(rsvps.map(getDept).filter(Boolean))];
    const filtered = filterDept === 'all' ? rsvps : rsvps.filter(r => getDept(r) === filterDept);

    // Group by department
    const grouped = filtered.reduce((acc, r) => {
        const dept = getDept(r);
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(r);
        return acc;
    }, {});

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <button onClick={() => navigate('/admin/events')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back to Events
            </button>

            {/* Event header */}
            <div className="glass-card p-6 mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">{event?.title}</h1>
                <p className="text-gray-400 text-sm">
                    {event?.date && format(new Date(event.date), 'MMM d, yyyy')} · {event?.location}
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <Users size={15} className="text-primary-400" />
                    <span className="text-white font-semibold">{rsvps.length}</span>
                    <span className="text-gray-400 text-sm">total responses</span>
                </div>
            </div>

            {/* Department filter */}
            {depts.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {depts.map(d => (
                        <button key={d} onClick={() => setFilterDept(d)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${filterDept === d
                                ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                                : 'border-dark-500 text-gray-400 hover:border-dark-400 bg-dark-700'
                                }`}>
                            {d === 'all' ? `All (${rsvps.length})` : `${d} (${rsvps.filter(r => getDept(r) === d).length})`}
                        </button>
                    ))}
                </div>
            )}

            {/* RSVP list grouped by dept */}
            {Object.keys(grouped).length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Users size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No RSVPs yet for this event</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([dept, list]) => (
                        <div key={dept} className="card space-y-4">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-primary-400" />
                                <h3 className="font-semibold text-white">{dept}</h3>
                                <span className="badge bg-dark-500 text-gray-400 text-xs">{list.length}</span>
                            </div>
                            <div className="divide-y divide-dark-600">
                                {list.map((r) => {
                                    const sc = STATUS_STYLES[r.status] || STATUS_STYLES.attending;
                                    const Icon = sc.icon;
                                    const studentName = r.personalInfo?.fullName || r.user?.name || 'Unknown User';
                                    const rollNumber = r.personalInfo?.studentId || r.user?.rollNumber;
                                    const email = r.contactDetails?.email || r.user?.email;
                                    const college = r.academicInfo?.college;
                                    const yearLevel = r.academicInfo?.yearLevel;

                                    return (
                                        <div key={r._id} className="flex items-center justify-between py-4 gap-3">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {studentName[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <p className="text-sm font-semibold text-white truncate">{studentName}</p>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                                                        {rollNumber && <span className="text-gray-300 font-mono bg-dark-600 px-1.5 py-0.5 rounded">{rollNumber}</span>}
                                                        {email && <span>{email}</span>}
                                                        {(college || yearLevel) && <span className="text-dark-400">•</span>}
                                                        {college && <span className="text-violet-300">{college}</span>}
                                                        {yearLevel && <span className="text-primary-300">({yearLevel})</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    {r.checkedIn && <span className="badge bg-emerald-500/20 text-emerald-400 text-xs">✓ In</span>}
                                                    <span className={`badge ${sc.badge} flex items-center gap-1 text-xs`}>
                                                        <Icon size={11} />
                                                        {r.status === 'attending' ? 'Attending' : r.status === 'maybe' ? 'Maybe' : "Can't make it"}
                                                    </span>
                                                </div>
                                                {r.ticketType && r.ticketType !== 'General' && (
                                                    <span className="text-xs text-gray-500">Ticket: {r.ticketType}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminRSVP;
