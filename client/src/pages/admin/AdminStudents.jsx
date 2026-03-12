import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import { Users, Mail, Hash, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['all', 'CSE', 'ECE', 'MECH', 'IT', 'CIVIL', 'MBA', 'OTHER'];

const DEPT_COLORS = {
    CSE: 'bg-emerald-500/20 text-emerald-400',
    ECE: 'bg-purple-500/20 text-purple-400',
    MECH: 'bg-orange-500/20 text-orange-400',
    IT: 'bg-cyan-500/20 text-cyan-400',
    CIVIL: 'bg-green-500/20 text-green-400',
    MBA: 'bg-pink-500/20 text-pink-400',
    OTHER: 'bg-gray-500/20 text-gray-400',
};

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [activeDept, setActiveDept] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchStudents = async (dept) => {
        setLoading(true);
        try {
            const res = await adminAPI.getStudents(dept === 'all' ? null : dept);
            setStudents(res.data);
        } catch {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(activeDept); }, [activeDept]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                    <Users size={28} className="text-primary-400" /> Student Directory
                </h1>
                <p className="text-gray-400 mt-1">{students.length} student{students.length !== 1 ? 's' : ''} found</p>
            </div>

            {/* Department tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {DEPARTMENTS.map(d => (
                    <button key={d} onClick={() => setActiveDept(d)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${activeDept === d
                            ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                            : 'border-dark-500 text-gray-400 hover:border-dark-400 bg-dark-700'
                            }`}>
                        {d === 'all' ? 'All Depts' : d}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : students.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Users size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No students found{activeDept !== 'all' ? ` in ${activeDept}` : ''}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {students.map((s) => {
                        const deptClass = DEPT_COLORS[s.department] || 'bg-gray-500/20 text-gray-400';
                        return (
                            <div key={s._id} className="card flex flex-col gap-3 hover:-translate-y-1 transition-all duration-200">
                                {/* Avatar + Dept */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center font-bold text-white flex-shrink-0">
                                        {s.name?.[0]?.toUpperCase()}
                                    </div>
                                    {s.department && (
                                        <span className={`badge text-xs ${deptClass}`}>{s.department}</span>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <p className="font-semibold text-white text-sm">{s.name}</p>
                                    {s.rollNumber && (
                                        <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                            <Hash size={11} /> {s.rollNumber}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <p className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                                    <Mail size={11} className="text-gray-600 flex-shrink-0" /> {s.email}
                                </p>

                                {/* RSVP Count */}
                                <div className="flex items-center gap-1.5 text-xs text-primary-400 font-medium pt-1 border-t border-dark-600 mt-auto">
                                    <Building2 size={12} />
                                    {s.rsvpCount} RSVP{s.rsvpCount !== 1 ? 's' : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminStudents;
