import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import { FileText, Search, Building2, Calendar, Mail, Phone, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    attending: { badge: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle, label: 'Attending' },
    maybe: { badge: 'bg-yellow-500/20 text-yellow-400', icon: Clock, label: 'Maybe' },
    not_attending: { badge: 'bg-red-500/20 text-red-400', icon: XCircle, label: 'Not Attending' },
};

const AdminRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const res = await adminAPI.getAllRegistrations();
                setRegistrations(res.data);
            } catch (error) {
                toast.error('Failed to load registrations');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

    const filteredRegistrations = registrations.filter(reg => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const userName = (reg.personalInfo?.fullName || reg.user?.name || '').toLowerCase();
        const userEmail = (reg.contactDetails?.email || reg.user?.email || '').toLowerCase();
        const eventTitle = (reg.event?.title || '').toLowerCase();
        const rollNumber = (reg.personalInfo?.studentId || reg.user?.rollNumber || '').toLowerCase();
        const collegeName = (reg.academicInfo?.college || '').toLowerCase();
        return userName.includes(q) || userEmail.includes(q) || eventTitle.includes(q) || rollNumber.includes(q) || collegeName.includes(q);
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                        <FileText className="text-primary-400" size={32} />
                        Event Registrations
                    </h1>
                    <p className="text-black mt-2">
                        View and manage all student event registrations across the platform.
                    </p>
                </div>
                <div className="relative w-full md:w-72 mt-4 md:mt-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-500" size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search student, email, or event..."
                        className="input pl-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content area */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredRegistrations.length === 0 ? (
                <div className="glass-card text-center py-20">
                    <FileText className="mx-auto text-gray-600 mb-4" size={48} />
                    <h3 className="text-xl font-medium text-white mb-2">No registrations found</h3>
                    <p className="text-gray-400">
                        {searchQuery ? "No results match your search criteria." : "There are currently no event registrations."}
                    </p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-dark-600 bg-white/50 text-sm">
                                    <th className="py-4 px-6 font-semibold text-black">Student Info</th>
                                    <th className="py-4 px-6 font-semibold text-black">Contact Details</th>
                                    <th className="py-4 px-6 font-semibold text-black">Event Details</th>
                                    <th className="py-4 px-6 font-semibold text-black">Registration Date</th>
                                    <th className="py-4 px-6 font-semibold text-black">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-600/50">
                                {filteredRegistrations.map((reg) => {
                                    const StatusIcon = STATUS_STYLES[reg.status]?.icon || STATUS_STYLES.attending.icon;
                                    const statusBadge = STATUS_STYLES[reg.status]?.badge || STATUS_STYLES.attending.badge;
                                    const statusLabel = STATUS_STYLES[reg.status]?.label || STATUS_STYLES.attending.label;

                                    const userName = reg.personalInfo?.fullName || reg.user?.name || 'Unknown Student';
                                    const rollNumber = reg.personalInfo?.studentId || reg.user?.rollNumber || '';
                                    const department = reg.academicInfo?.department || reg.user?.department || '';
                                    const college = reg.academicInfo?.college || '';
                                    const userEmail = reg.contactDetails?.email || reg.user?.email || '';
                                    const userPhone = reg.contactDetails?.phone || reg.user?.phone || '';

                                    return (
                                        <tr key={reg._id} className="hover:bg-dark-700/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                        {userName[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-black">
                                                            {userName}
                                                        </p>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {rollNumber && (
                                                                    <span className="text-xs text-black font-mono bg-gray-200 px-1.5 py-0.5 rounded">
                                                                        {rollNumber}
                                                                    </span>
                                                                )}
                                                                {department && (
                                                                    <span className="text-xs text-black flex items-center gap-1">
                                                                        <Building2 size={10} /> {department}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {college && (
                                                                <span className="text-xs text-gray-600 flex items-center gap-1 leading-tight max-w-[200px] truncate" title={college}>
                                                                    {college}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    {userEmail && (
                                                        <p className="text-xs text-black flex items-center gap-1.5 font-medium">
                                                            <Mail size={12} className="text-black" />
                                                            {userEmail}
                                                        </p>
                                                    )}
                                                    {userPhone && (
                                                        <p className="text-xs text-black flex items-center gap-1.5 mt-1 font-medium">
                                                            <Phone size={12} className="text-black" />
                                                            {userPhone}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-black truncate max-w-[200px]" title={reg.event?.title}>
                                                        {reg.event?.title || 'Unknown Event'}
                                                    </p>
                                                    <p className="text-xs text-black flex items-center gap-1 font-medium">
                                                        <Calendar size={12} />
                                                        {reg.event?.date ? format(new Date(reg.event.date), 'MMM d, yyyy') : 'No date'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-black font-medium">
                                                {format(new Date(reg.createdAt), 'MMM d, yyyy h:mm a')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-current/20 ${statusBadge}`}>
                                                    <StatusIcon size={12} />
                                                    {statusLabel}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRegistrations;
