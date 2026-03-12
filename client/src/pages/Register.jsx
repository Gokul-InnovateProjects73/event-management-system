import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Hash, Building2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'IT', 'CIVIL', 'MBA', 'OTHER'];

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [role, setRole] = useState('student');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        department: 'CSE',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await register({
                name: form.name,
                email: form.email,
                password: form.password,
                role,
                rollNumber: role === 'student' ? form.rollNumber : '',
                department: role === 'student' ? form.department : '',
            });
            toast.success('Registered successfully! 🎉');
            navigate(data.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                        <span className="text-2xl">🎓</span>
                    </div>
                    <h1 className="text-3xl font-bold text-black">
                        EventHub
                    </h1>
                    <p className="text-gray-400 mt-1 text-sm">Create your account</p>
                </div>

                <div className="glass-card p-8 space-y-5">
                    {/* Role Selector */}
                    <div>
                        <p className="label mb-2">I am a…</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { value: 'student', label: 'Student', icon: '🎓' },
                                { value: 'admin', label: 'Admin', icon: '🛡️' },
                            ].map(({ value, label, icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRole(value)}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all ${role === value
                                            ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                                            : 'border-dark-500 text-gray-400 hover:border-dark-400 bg-dark-700'
                                        }`}
                                >
                                    <span>{icon}</span> {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input id="reg-name" name="name" type="text" placeholder="John Doe"
                                    value={form.name} onChange={handleChange} required
                                    className="input-field pl-10" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input id="reg-email" name="email" type="email" placeholder="you@example.com"
                                    value={form.email} onChange={handleChange} required
                                    className="input-field pl-10" />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input id="reg-password" name="password" type="password" placeholder="Min. 6 characters"
                                    value={form.password} onChange={handleChange} required minLength={6}
                                    className="input-field pl-10" />
                            </div>
                        </div>

                        {/* Student-only fields */}
                        {role === 'student' && (
                            <>
                                <div>
                                    <label className="label">Roll Number</label>
                                    <div className="relative">
                                        <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input id="reg-roll" name="rollNumber" type="text" placeholder="e.g. 22CS001"
                                            value={form.rollNumber} onChange={handleChange} required
                                            className="input-field pl-10" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Department</label>
                                    <div className="relative">
                                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <select id="reg-dept" name="department" value={form.department}
                                            onChange={handleChange}
                                            className="input-field pl-10 appearance-none cursor-pointer">
                                            {DEPARTMENTS.map(d => (
                                                <option key={d} value={d} className="bg-dark-700">{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading
                                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
