import { useState } from 'react';
import { rsvpAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ScanLine, UserCheck, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CheckIn = () => {
    const { isAdmin, isStaff } = useAuth();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isAdmin && !isStaff) {
        navigate('/dashboard');
        return null;
    }

    const handleCheckIn = async (e) => {
        e.preventDefault();
        if (!token.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const res = await rsvpAPI.checkIn(token.trim());
            setResult({ ...res.data, success: true });
            if (res.data.alreadyCheckedIn) {
                toast('⚠️ Already checked in', { icon: '⚠️' });
            } else {
                toast.success('✅ Check-in successful!');
            }
        } catch (err) {
            setResult({ error: err.response?.data?.message || 'Invalid token', success: false });
            toast.error('Check-in failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <ScanLine size={28} className="text-primary-400" /> Event Check-In
                </h1>
                <p className="text-gray-400 mt-1">Enter the attendee's check-in token to verify attendance</p>
            </div>

            <div className="card">
                <form onSubmit={handleCheckIn} className="space-y-4">
                    <div>
                        <label className="label">Check-In Token</label>
                        <input
                            className="input-field font-mono text-sm"
                            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">The token is found on the attendee's profile page under their RSVP details</p>
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <UserCheck size={16} />}
                        Verify & Check In
                    </button>
                </form>
            </div>

            {result && (
                <div className={`card border-2 ${result.success ? 'border-emerald-500/50' : 'border-red-500/50'}`}>
                    {result.success ? (
                        <div className="space-y-3">
                            <div className={`flex items-center gap-2 font-semibold ${result.alreadyCheckedIn ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                <UserCheck size={20} />
                                {result.alreadyCheckedIn ? 'Already Checked In' : 'Check-In Successful!'}
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-dark-600 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center font-bold flex-shrink-0">
                                    {result.rsvp?.user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{result.rsvp?.user?.name}</p>
                                    <p className="text-sm text-gray-400">{result.rsvp?.user?.email}</p>
                                </div>
                                <span className="ml-auto badge bg-primary-500/20 text-primary-400 capitalize">{result.rsvp?.ticketType}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Calendar size={14} className="text-primary-400" />
                                    <span>{result.rsvp?.event?.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <MapPin size={14} className="text-emerald-400" />
                                    <span>{result.rsvp?.event?.location}</span>
                                </div>
                                {result.rsvp?.checkedInAt && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Checked in at: {format(new Date(result.rsvp.checkedInAt), 'MMM d, yyyy • h:mm a')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-red-400 flex items-center gap-2">
                            <ScanLine size={18} /> {result.error}
                        </div>
                    )}
                </div>
            )}

            <button onClick={() => { setToken(''); setResult(null); }} className="btn-secondary w-full">
                Clear / Next Attendee
            </button>
        </div>
    );
};

export default CheckIn;
