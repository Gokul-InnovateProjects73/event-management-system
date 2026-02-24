import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../api/api';
import { format } from 'date-fns';
import { Calendar, MapPin, FileText, Tag, Users, Image, Globe, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['conference', 'workshop', 'social', 'sports', 'music', 'other'];

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        endDate: '',
        category: 'other',
        capacity: 100,
        imageUrl: '',
        isPublic: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await eventAPI.create(form);
            toast.success('Event created! 🎉');
            navigate(`/events/${res.data._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    // Minimum datetime for the date picker (now)
    const nowLocal = format(new Date(), "yyyy-MM-dd'T'HH:mm");

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={18} /> Back
            </button>

            <div className="glass-card p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Create New Event</h1>
                    <p className="text-gray-400 mt-1">Fill in the details to organise your event</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="label">Event Title *</label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                id="event-title"
                                name="title"
                                type="text"
                                placeholder="e.g. Tech Conference 2026"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Description *</label>
                        <textarea
                            id="event-desc"
                            name="description"
                            rows={4}
                            placeholder="Describe your event..."
                            value={form.description}
                            onChange={handleChange}
                            required
                            className="input-field resize-none"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="label">Location *</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                id="event-location"
                                name="location"
                                type="text"
                                placeholder="e.g. Chennai Convention Centre"
                                value={form.location}
                                onChange={handleChange}
                                required
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Start Date & Time *</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="event-date"
                                    name="date"
                                    type="datetime-local"
                                    min={nowLocal}
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">End Date & Time</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="event-end-date"
                                    name="endDate"
                                    type="datetime-local"
                                    min={form.date || nowLocal}
                                    value={form.endDate}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category & Capacity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Category</label>
                            <div className="relative">
                                <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <select
                                    id="event-category"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="input-field pl-10 capitalize appearance-none cursor-pointer"
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c} value={c} className="capitalize bg-dark-700">{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label">Capacity</label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="event-capacity"
                                    name="capacity"
                                    type="number"
                                    min={1}
                                    value={form.capacity}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="label">Cover Image URL (optional)</label>
                        <div className="relative">
                            <Image size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                id="event-image"
                                name="imageUrl"
                                type="url"
                                placeholder="https://..."
                                value={form.imageUrl}
                                onChange={handleChange}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center justify-between p-4 bg-dark-600 rounded-xl border border-dark-500">
                        <div className="flex items-center gap-3">
                            {form.isPublic ? (
                                <Globe size={18} className="text-green-400" />
                            ) : (
                                <Lock size={18} className="text-yellow-400" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {form.isPublic ? 'Public Event' : 'Private Event'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {form.isPublic ? 'Visible to everyone' : 'Only invited guests'}
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                id="event-public"
                                type="checkbox"
                                name="isPublic"
                                checked={form.isPublic}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-dark-400 peer-checked:bg-primary-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-primary-500/50 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1">
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : '🎉 Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
