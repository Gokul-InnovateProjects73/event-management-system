import { Info, CheckCircle, Zap, Shield, Heart } from 'lucide-react';

const AboutFeature = ({ icon: Icon, title, description, color }) => (
    <div className="glass-card p-6 flex flex-col gap-4 hover:border-primary-500/30 transition-all group">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
        </div>
    </div>
);

const About = () => {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-4">
                    <Info size={16} /> Welcome to EventHub
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                    Manage Events with <span className="text-black">Modern Efficiency</span>
                </h1>
                <p className="text-lg text-gray-400 leading-relaxed">
                    The Event Management System is a professional web-based application designed to organize and manage college or organizational events with a focused, modern experience.
                </p>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AboutFeature 
                    icon={Shield} 
                    title="Centralized Management" 
                    color="bg-primary-600"
                    description="Administrators can create, update, and manage workshops, seminars, and fests from a single, intuitive interface."
                />
                <AboutFeature 
                    icon={Zap} 
                    title="Real-time Interaction" 
                    color="bg-violet-600"
                    description="Live event schedules, countdown timers, and instant registration status updates for a dynamic experience."
                />
                <AboutFeature 
                    icon={CheckCircle} 
                    title="RSVP Simplified" 
                    color="bg-emerald-600"
                    description="Students can easily confirm attendance, manage registrations, and present secure tokens at the event entrance."
                />
                <AboutFeature 
                    icon={Shield} 
                    title="Reliable Performance" 
                    color="bg-cyan-600"
                    description="Engineered to prevent rendering errors, ensuring that all components and pages load correctly for every user."
                />
            </div>

            {/* Redesign Highlight */}
            <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">Completely Redesigned UI</h2>
                        <p className="text-gray-400 leading-relaxed">
                            The application has been transformed with a modern and professional layout. The updated design includes improved color themes, better navigation, responsive components, and a clean user-friendly interface to make registration seamless.
                        </p>
                        <ul className="space-y-3">
                            {['Streamlined navigation', 'Intuitive multi-step registration', 'Glassmorphism-inspired aesthetics', 'Fully responsive mobile-first approach'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-dark-700/50 rounded-2xl border border-dark-600 flex flex-col items-center justify-center gap-2 p-6 text-center">
                            <span className="text-3xl font-bold text-white">100%</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Responsive</span>
                        </div>
                        <div className="aspect-square bg-dark-700/50 rounded-2xl border border-dark-600 flex flex-col items-center justify-center gap-2 p-6 text-center mt-8">
                            <span className="text-3xl font-bold text-white">0.2s</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">HMR Latency</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission */}
            <div className="text-center py-20 border-t border-dark-500/50">
                <Heart className="text-red-500 mx-auto mb-6 animate-pulse" size={32} />
                <h2 className="text-2xl font-bold text-white mb-4 italic">Providing a platform similar to KnowFest</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Our main objective is to reduce manual event management processes and provide a seamless environment for participation in college life.
                </p>
            </div>
        </div>
    );
};

export default About;
