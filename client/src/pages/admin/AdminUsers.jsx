import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import { Search, UserCog, Edit2, Trash2, X, Check, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);

    // Form states
    const [editFormData, setEditFormData] = useState({
        name: '', email: '', role: '', department: '', rollNumber: '', phone: ''
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await adminAPI.getAllUsers();
            setUsers(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditFormData({
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'student',
            department: user.department || '',
            rollNumber: user.rollNumber || '',
            phone: user.phone || ''
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await adminAPI.updateUser(editingUser._id, editFormData);
            setUsers(users.map(u => u._id === editingUser._id ? res.data : u));
            toast.success('User updated successfully');
            setEditingUser(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        try {
            await adminAPI.deleteUser(deletingUserId);
            setUsers(users.filter(u => u._id !== deletingUserId));
            toast.success('User deleted successfully');
            setDeletingUserId(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
            setDeletingUserId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                        <UserCog className="text-primary-500" size={32} /> User Management
                    </h1>
                    <p className="text-gray-500 mt-2">Manage all registered accounts, roles, and details.</p>
                </div>
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute text-gray-400 left-3 top-1/2 -translate-y-1/2" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-black"
                    />
                </div>
            </div>

            {/* Table section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-xs uppercase bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Department / Roll No</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-black">{u.name}</p>
                                                    <p className="text-xs text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-black">{u.department || '—'}</p>
                                            <p className="text-xs text-gray-500">{u.rollNumber || '—'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-black">{u.email}</p>
                                            <p className="text-xs text-gray-500">{u.phone || 'No phone'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEditClick(u)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {u._id !== currentUser._id && (
                                                    <button 
                                                        onClick={() => setDeletingUserId(u._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-fade-in shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-black flex items-center gap-2">
                                <Edit2 className="text-primary-500"/> Edit User
                            </h2>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-black">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input required type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="input-field w-full text-black bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input required type="email" name="email" value={editFormData.email} onChange={handleEditChange} className="input-field w-full text-black bg-gray-50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select name="role" value={editFormData.role} onChange={handleEditChange} className="input-field w-full text-black bg-gray-50 h-[42px]">
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} className="input-field w-full text-black bg-gray-50" />
                                </div>
                            </div>

                            {editFormData.role === 'student' && (
                                <div className="grid grid-cols-2 gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select name="department" value={editFormData.department} onChange={handleEditChange} className="input-field w-full text-black bg-white h-[42px]">
                                            <option value="">Select Dept</option>
                                            <option value="CSE">CSE</option>
                                            <option value="IT">IT</option>
                                            <option value="ECE">ECE</option>
                                            <option value="EEE">EEE</option>
                                            <option value="MECH">MECH</option>
                                            <option value="CIVIL">CIVIL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                        <input type="text" name="rollNumber" value={editFormData.rollNumber} onChange={handleEditChange} className="input-field w-full text-black bg-white" placeholder="e.g. 21CS01" />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 font-medium text-gray-500 hover:text-black">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex items-center gap-2">
                                    <Check size={16} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingUserId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl animate-fade-in">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">Delete User?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            This action cannot be undone. All of the user's data and registrations will be permanently deleted.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingUserId(null)} className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDeleteUser} className="flex-1 px-4 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
