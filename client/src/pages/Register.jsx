import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Welcome to EventHub! 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden px-4">
            {/* Background glows */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
                        <Calendar size={30} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-gray-400 mt-2">Join EventHub and start organizing</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="reg-name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="reg-email"
                                    name="email"
                                    type="email"
                                    placeholder="you@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="reg-password"
                                    name="password"
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="input-field pl-10 pr-11"
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="label">Confirm Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    id="reg-confirm"
                                    name="confirm"
                                    type={showPwd ? 'text' : 'password'}
                                    placeholder="Repeat your password"
                                    value={form.confirm}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <><Sparkles size={16} /> Create Account</>}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
