import { useState } from 'react';
import { X, User, Phone, MapPin, Briefcase, Info, AlertOctagon, CheckCircle } from 'lucide-react';

const RegistrationModal = ({ event, onClose, onSubmit, submitting, initialTicket, rsvpStatusOptions }) => {
    // Form States
    const [status, setStatus] = useState('attending');
    const [ticketType, setTicketType] = useState(initialTicket || (event.ticketTypes?.[0]?.name || ''));
    const [note, setNote] = useState('');

    // New Fields State
    const [personalInfo, setPersonalInfo] = useState({ fullName: '', dob: '', gender: '', studentId: '' });
    const [contactDetails, setContactDetails] = useState({ email: '', phone: '', address: '' });
    const [academicInfo, setAcademicInfo] = useState({ department: '', yearLevel: '', college: '' });
    const [eventSpecifics, setEventSpecifics] = useState({ session: '', dietary: '', tshirtSize: '' });
    const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            status, note, ticketType,
            personalInfo, contactDetails, academicInfo, eventSpecifics, emergencyContact
        });
    };

    const hasTickets = event.ticketTypes?.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-dark-600 flex justify-between items-center bg-dark-800/80 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Event Registration</h2>
                        <p className="text-sm text-gray-400">Complete your details for: <span className="font-semibold text-primary-400">{event.title}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-dark-700 h-1.5 flex">
                    <div className="h-full bg-primary-500 transition-all duration-300 ease-in-out" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="registrationForm" onSubmit={handleSubmit} className="space-y-6">

                        {/* Step 1: Status & Ticket */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                    <CheckCircle size={18} className="text-primary-400" /> Attendance Details
                                </h3>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300">Will you be attending?</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {rsvpStatusOptions.map(({ value, label, color }) => (
                                            <label key={value} className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${status === value ? color : 'border-dark-600 hover:border-dark-500 bg-dark-700/50'}`}>
                                                <input type="radio" value={value} checked={status === value} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                                                <span className="text-sm font-medium">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {status === 'attending' && hasTickets && (
                                    <div className="space-y-3 pt-4 border-t border-dark-600/50">
                                        <label className="text-sm font-medium text-gray-300">Select Admission Ticket</label>
                                        <div className="space-y-2">
                                            {event.ticketTypes.map(tt => {
                                                const remaining = tt.capacity - (tt.sold || 0);
                                                const sold = remaining <= 0;
                                                return (
                                                    <label key={tt.name} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${sold ? 'opacity-40 cursor-not-allowed border-dark-600' : ticketType === tt.name ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-dark-500 bg-dark-700/30'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <input type="radio" value={tt.name} checked={ticketType === tt.name} onChange={() => setTicketType(tt.name)} disabled={sold} className="hidden" />
                                                            <span className="text-sm font-medium text-white">{tt.name}</span>
                                                            {sold && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Sold Out</span>}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-primary-400">{tt.price > 0 ? `$${tt.price}` : 'Free'}</p>
                                                            <p className="text-xs text-gray-500">{remaining} remaining</p>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Personal & Contact Info (Only if Attending) */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                    <User size={18} className="text-violet-400" /> Personal Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Full Legal Name *</label>
                                        <input type="text" required value={personalInfo.fullName} onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} className="input-field" placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="label">Student ID / Roll No *</label>
                                        <input type="text" required value={personalInfo.studentId} onChange={e => setPersonalInfo({ ...personalInfo, studentId: e.target.value })} className="input-field" placeholder="AB123456" />
                                    </div>
                                    <div>
                                        <label className="label">Date of Birth</label>
                                        <input type="date" value={personalInfo.dob} onChange={e => setPersonalInfo({ ...personalInfo, dob: e.target.value })} className="input-field text-gray-300" />
                                    </div>
                                    <div>
                                        <label className="label">Gender</label>
                                        <select value={personalInfo.gender} onChange={e => setPersonalInfo({ ...personalInfo, gender: e.target.value })} className="input-field text-gray-300">
                                            <option value="">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-Binary">Non-Binary</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mt-8 mb-4">
                                    <Phone size={18} className="text-emerald-400" /> Contact Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Active Email Address *</label>
                                        <input type="email" required value={contactDetails.email} onChange={e => setContactDetails({ ...contactDetails, email: e.target.value })} className="input-field" placeholder="student@university.edu" />
                                    </div>
                                    <div>
                                        <label className="label">Mobile Phone Number *</label>
                                        <input type="tel" required value={contactDetails.phone} onChange={e => setContactDetails({ ...contactDetails, phone: e.target.value })} className="input-field" placeholder="+1 (555) 000-0000" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Current Mailing Address</label>
                                        <input type="text" value={contactDetails.address} onChange={e => setContactDetails({ ...contactDetails, address: e.target.value })} className="input-field" placeholder="123 Campus Rd, City, State, ZIP" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Academic & Emergency Info */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                    <Briefcase size={18} className="text-emerald-400" /> Academic Profile
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="label">College / University Name *</label>
                                        <input type="text" required value={academicInfo.college} onChange={e => setAcademicInfo({ ...academicInfo, college: e.target.value })} className="input-field" placeholder="State University" />
                                    </div>
                                    <div>
                                        <label className="label">Department / Major *</label>
                                        <input type="text" required value={academicInfo.department} onChange={e => setAcademicInfo({ ...academicInfo, department: e.target.value })} className="input-field" placeholder="Computer Science" />
                                    </div>
                                    <div>
                                        <label className="label">Current Year / Semester</label>
                                        <select value={academicInfo.yearLevel} onChange={e => setAcademicInfo({ ...academicInfo, yearLevel: e.target.value })} className="input-field text-gray-300">
                                            <option value="">Select...</option>
                                            <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                                            <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                                            <option value="Junior (Year 3)">Junior (Year 3)</option>
                                            <option value="Senior (Year 4)">Senior (Year 4)</option>
                                            <option value="Graduate">Graduate</option>
                                            <option value="Alumni">Alumni</option>
                                        </select>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mt-8 mb-4">
                                    <AlertOctagon size={18} className="text-red-400" /> Emergency Contact
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Contact Name *</label>
                                        <input type="text" required value={emergencyContact.name} onChange={e => setEmergencyContact({ ...emergencyContact, name: e.target.value })} className="input-field" placeholder="Jane Doe (Mother)" />
                                    </div>
                                    <div>
                                        <label className="label">Contact Phone Number *</label>
                                        <input type="tel" required value={emergencyContact.phone} onChange={e => setEmergencyContact({ ...emergencyContact, phone: e.target.value })} className="input-field" placeholder="+1 (555) 111-2222" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Event Specifics & Confirmation */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                    <Info size={18} className="text-yellow-400" /> Event Specifics
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {event.agenda?.length > 0 && (
                                        <div className="md:col-span-2">
                                            <label className="label">Preferred Session / Track</label>
                                            <select value={eventSpecifics.session} onChange={e => setEventSpecifics({ ...eventSpecifics, session: e.target.value })} className="input-field text-gray-300">
                                                <option value="">Select a preferred session...</option>
                                                <option value="All Tracks">Attending All Tracks</option>
                                                {event.agenda.map((item, i) => (
                                                    <option key={i} value={item.title}>{item.time} - {item.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label className="label">Dietary Restrictions</label>
                                        <input type="text" value={eventSpecifics.dietary} onChange={e => setEventSpecifics({ ...eventSpecifics, dietary: e.target.value })} className="input-field" placeholder="None, Vegan, Gluten-Free..." />
                                    </div>
                                    <div>
                                        <label className="label">T-Shirt Size (If applicable)</label>
                                        <select value={eventSpecifics.tshirtSize} onChange={e => setEventSpecifics({ ...eventSpecifics, tshirtSize: e.target.value })} className="input-field text-gray-300">
                                            <option value="">Select...</option>
                                            <option value="S">Small</option>
                                            <option value="M">Medium</option>
                                            <option value="L">Large</option>
                                            <option value="XL">X-Large</option>
                                            <option value="XXL">XX-Large</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Additional Message for Organizers</label>
                                        <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} className="input-field resize-none" placeholder="Any special requirements or questions..." />
                                    </div>
                                </div>

                                <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl mt-6">
                                    <p className="text-sm text-primary-200">
                                        <strong>Ready to submit?</strong> Please ensure all entered information is accurate. You will receive a confirmation notification once your registration is successfully processed.
                                    </p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-dark-600 bg-dark-800/80 flex justify-between items-center sticky bottom-0">
                    <button
                        type="button"
                        onClick={currentStep === 1 ? onClose : handlePrev}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <div className="flex gap-3">
                        {status !== 'attending' && currentStep === 1 ? (
                            <button form="registrationForm" type="submit" disabled={submitting} className="btn-primary py-2 px-6">
                                {submitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update Status'}
                            </button>
                        ) : currentStep < totalSteps ? (
                            <button type="button" onClick={handleNext} className="btn-primary py-2 px-6">
                                Next Step
                            </button>
                        ) : (
                            <button form="registrationForm" type="submit" disabled={submitting} className="btn-primary py-2 px-6 bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-400 hover:to-violet-400">
                                {submitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Complete Registration'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationModal;
