import { useState, useEffect } from 'react';
import { speakerAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Mic, Plus, Trash2, Building2, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const SpeakerCard = ({ speaker, onDelete, canDelete }) => (
    <div className="card relative group">
        {canDelete && (
            <button
                onClick={() => onDelete(speaker._id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400"
            >
                <Trash2 size={14} />
            </button>
        )}
        <div className="flex items-start gap-3">
            {speaker.photo ? (
                <img src={speaker.photo} alt={speaker.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {speaker.name[0]?.toUpperCase()}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{speaker.name}</p>
                {(speaker.title || speaker.company) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {speaker.title && <span className="flex items-center gap-1 text-xs text-primary-400"><Briefcase size={10} />{speaker.title}</span>}
                        {speaker.company && <span className="flex items-center gap-1 text-xs text-gray-400"><Building2 size={10} />{speaker.company}</span>}
                    </div>
                )}
                {speaker.bio && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{speaker.bio}</p>}
            </div>
        </div>
    </div>
);

const Speakers = () => {
    const { isAdmin } = useAuth();
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', bio: '', photo: '', title: '', company: '', eventId: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchSpeakers = async () => {
        try {
            const res = await speakerAPI.getForEvent('');
            setSpeakers(res.data);
        } catch {
            toast.error('Failed to load speakers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSpeakers(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this speaker?')) return;
        try {
            await speakerAPI.delete(id);
            setSpeakers(prev => prev.filter(s => s._id !== id));
            toast.success('Speaker removed');
        } catch {
            toast.error('Failed to remove speaker');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await speakerAPI.create(form);
            setSpeakers(prev => [res.data, ...prev]);
            setShowForm(false);
            setForm({ name: '', bio: '', photo: '', title: '', company: '', eventId: '' });
            toast.success('Speaker added!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add speaker');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <Mic size={28} className="text-primary-400" /> Speakers
                    </h1>
                    <p className="text-gray-400 mt-1">All event speakers and presenters</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        <Plus size={18} /> Add Speaker
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card">
                    <h2 className="font-semibold text-white mb-4">New Speaker</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="label">Event ID *</label>
                            <input className="input-field font-mono text-sm" placeholder="Paste the event _id from MongoDB" value={form.eventId} onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="label">Name *</label>
                            <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="label">Photo URL</label>
                            <input className="input-field" placeholder="https://..." value={form.photo} onChange={e => setForm(p => ({ ...p, photo: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Title</label>
                            <input className="input-field" placeholder="e.g. CTO, Keynote Speaker" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Company</label>
                            <input className="input-field" placeholder="e.g. Acme Corp" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label">Bio</label>
                            <textarea className="input-field resize-none" rows={2} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                        </div>
                        <div className="sm:col-span-2 flex gap-3">
                            <button type="submit" disabled={submitting} className="btn-primary">
                                {submitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />} Add Speaker
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {speakers.length === 0 ? (
                <div className="card text-center py-16">
                    <Mic size={40} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No speakers added yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {speakers.map(s => (
                        <SpeakerCard key={s._id} speaker={s} onDelete={handleDelete} canDelete={isAdmin} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Speakers;
