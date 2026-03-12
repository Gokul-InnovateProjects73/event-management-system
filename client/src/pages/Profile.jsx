import { useState, useEffect } from 'react';
import { authAPI } from '../api/api';
import { rsvpAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, FileText, Save, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: '', phone: '', bio: '', avatar: '' });
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                phone: user.phone || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
            });
        }
        rsvpAPI.getMyRSVPEvents()
            .then(res => setRsvps(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await authAPI.updateProfile(form);
            updateUser(res.data);
            toast.success('Profile updated! ✅');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const statusIcon = (status) => {
        if (status === 'attending') return <CheckCircle size={14} className="text-emerald-400" />;
        if (status === 'maybe') return <HelpCircle size={14} className="text-yellow-400" />;
        return <XCircle size={14} className="text-red-400" />;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                    <User size={28} className="text-primary-400" /> My Profile
                </h1>
                <p className="text-gray-400 mt-1">Manage your personal information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Form */}
                <div className="lg:col-span-2">
                    <div className="card">
                        {/* Avatar preview */}
                        <div className="flex items-center gap-4 mb-6">
                            {form.avatar ? (
                                <img src={form.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-500" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-2xl font-bold">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-white font-semibold">{user?.name}</p>
                                <span className={`badge text-xs capitalize mt-1 ${user?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                        user?.role === 'staff' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-primary-500/20 text-primary-400'
                                    }`}>{user?.role}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="label flex items-center gap-1.5"><User size={13} /> Full Name</label>
                                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="label flex items-center gap-1.5"><Mail size={13} /> Email</label>
                                <input className="input-field opacity-60 cursor-not-allowed" value={user?.email || ''} disabled />
                            </div>
                            <div>
                                <label className="label flex items-center gap-1.5"><Phone size={13} /> Phone</label>
                                <input className="input-field" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label flex items-center gap-1.5"><FileText size={13} /> Bio</label>
                                <textarea className="input-field resize-none" rows={3} placeholder="A short bio about yourself..." value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                            </div>
                            <div>
                                <label className="label">Avatar URL</label>
                                <input className="input-field" placeholder="https://example.com/photo.jpg" value={form.avatar} onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))} />
                            </div>
                            <button type="submit" disabled={saving} className="btn-primary w-full">
                                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RSVP History */}
                <div className="card h-fit">
                    <h2 className="font-semibold text-white mb-4">My RSVPs</h2>
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : rsvps.length === 0 ? (
                        <p className="text-gray-500 text-sm">No RSVPs yet.</p>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {rsvps.map((r) => (
                                <div key={r._id} className="p-3 bg-dark-600 rounded-xl">
                                    <p className="text-sm font-medium text-white line-clamp-1">{r.event?.title}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-gray-500">
                                            {r.event?.date ? format(new Date(r.event.date), 'MMM d, yyyy') : ''}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {statusIcon(r.status)}
                                            <span className="text-xs text-gray-400 capitalize">{r.status?.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    {r.checkedIn && (
                                        <span className="badge bg-emerald-500/20 text-emerald-400 text-xs mt-1">✓ Checked In</span>
                                    )}
                                    {r.checkInToken && !r.checkedIn && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-500 mb-1">Check-in Token:</p>
                                            <code className="text-xs bg-dark-500 px-2 py-1 rounded block break-all text-primary-300">{r.checkInToken}</code>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
