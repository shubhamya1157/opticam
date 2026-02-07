import { useState, useEffect } from "react";
import { X, User, BookOpen, Layers, Users, Mail, IdCard, GraduationCap, Edit, Save, LogOut } from "lucide-react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({ isOpen, onClose, user, onUpdateUser }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Init form data when user prop changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                year: user.year || "",
                semester: user.semester || "",
                branch: user.branch || "",
                section: user.section || ""
            });
        }
    }, [user]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.put("/auth/update-profile", {
                email: user.email, // backend uses email to find user
                updates: formData
            });

            if (res.data.success) {
                onUpdateUser(res.data.user); // update parent state
                setIsEditing(false);
            } else {
                setError(res.data.message || "Failed to update");
            }
        } catch (err) {
            console.error(err);
            setError("Update failed. Server error.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear any local storage if you use it (not used currently, just redirects)
        navigate("/login");
    };

    // Reusable Field Component
    const DetailRow = ({ icon, label, fieldKey, options }) => {
        const isEditable = isEditing;
        const value = formData[fieldKey];

        return (
            <div className="flex items-center gap-4 p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">
                <div className="p-2 bg-[#1d9bf0]/10 text-[#1d9bf0] rounded-lg">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">{label}</p>

                    {isEditable ? (
                        options ? (
                            <select
                                value={value}
                                onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1d9bf0]"
                            >
                                <option value="">Select {label}</option>
                                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
                                className="w-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#1d9bf0]"
                            />
                        )
                    ) : (
                        <p className="text-[var(--text-primary)] font-medium">{value || "Not set"}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            {/* Modal Card */}
            <div className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] z-10 p-2 bg-[var(--bg-tertiary)] rounded-full hover:bg-[var(--border-color)] transition"
                >
                    <X size={20} />
                </button>

                {/* Left Side: Photo & Identity (Static) */}
                <div className="md:w-1/3 bg-gradient-to-b from-[#1d9bf0]/10 to-[var(--bg-secondary)] p-8 flex flex-col items-center justify-center border-r border-[var(--border-color)]">
                    <div className="w-32 h-32 rounded-full p-1.5 bg-gradient-to-br from-[#1d9bf0] to-purple-500 mb-4 shadow-xl shadow-[#1d9bf0]/20 relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl opacity-30 rounded-full"></div>
                        <img
                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                            alt="Profile"
                            className="w-full h-full rounded-full bg-[var(--bg-secondary)] relative z-10"
                        />
                    </div>

                    <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-1">{user?.name}</h2>
                    <p className="text-[#1d9bf0] text-sm font-medium bg-[#1d9bf0]/10 px-3 py-1 rounded-full border border-[#1d9bf0]/20">
                        {user?.role === 'cr' ? 'Class Representative' : 'Student'}
                    </p>

                    {/* Static Identity Fields */}
                    <div className="mt-8 w-full space-y-3">
                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <Mail size={16} />
                            <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <IdCard size={16} />
                            <span>{user?.collegeId || "No ID"}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Details & Edit Form */}
                <div className="md:w-2/3 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">Profile Details</h3>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] px-4 py-2 rounded-xl transition border border-[var(--border-color)]"
                            >
                                <Edit size={16} /> Edit Profile
                            </button>
                        ) : null}
                    </div>

                    {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-2 rounded">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailRow icon={<User size={18} />} label="Full Name" fieldKey="name" />
                        <DetailRow icon={<GraduationCap size={18} />} label="Year" fieldKey="year" options={['1st Year', '2nd Year', '3rd Year', '4th Year']} />
                        <DetailRow icon={<BookOpen size={18} />} label="Semester" fieldKey="semester" options={['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']} />
                        <DetailRow icon={<Layers size={18} />} label="Branch" fieldKey="branch" options={['CSE', 'AI-DE', 'ECE']} />
                        <DetailRow icon={<Users size={18} />} label="Section" fieldKey="section" options={['A', 'B', 'C']} />
                    </div>

                    {/* Editing Actions */}
                    {isEditing && (
                        <div className="flex gap-3 justify-end mt-8 border-t border-[var(--border-color)] pt-6">
                            <button
                                onClick={() => { setIsEditing(false); setError(""); }}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white px-6 py-2 rounded-xl font-medium transition disabled:opacity-50 shadow-lg shadow-[#1d9bf0]/20"
                            >
                                {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    )}

                    {/* Logout (Only visible when not editing) */}
                    {!isEditing && (
                        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 px-4 py-2 rounded-xl transition text-sm"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
