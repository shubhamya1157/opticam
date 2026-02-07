import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../services/notificationService";
import {
    Bell, AlertTriangle, CheckCircle, Info, FileText, Calendar,
    CheckCheck, Clock, ArrowRight, Zap
} from "lucide-react";

export default function Notifications() {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread'

    const loadNotifications = async () => {
        try {
            const res = await fetchNotifications(user._id);
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user._id) {
            loadNotifications();
        }
    }, [user]);


    const handleMarkAllRead = async () => {
        await markAllNotificationsRead(user._id);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = async (note) => {
        if (!note.isRead) {
            await markNotificationRead(note._id);
            setNotifications(prev => prev.map(n => n._id === note._id ? { ...n, isRead: true } : n));
        }
        if (note.link) {
            navigate(note.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'cancellation': return <AlertTriangle className="text-red-500" size={20} />;
            case 'alert': return <AlertTriangle className="text-orange-500" size={20} />;
            case 'success': return <CheckCircle className="text-green-500" size={20} />;
            case 'assignment': return <FileText className="text-blue-400" size={20} />;
            case 'exam': return <Calendar className="text-purple-500" size={20} />;
            case 'system': return <Zap className="text-yellow-400" size={20} />;
            default: return <Info className="text-gray-400" size={20} />;
        }
    };

    const filteredNotifications = activeTab === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    // Grouping Logic
    const groupedNotifications = filteredNotifications.reduce((acc, note) => {
        const date = new Date(note.createdAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let key = date.toLocaleDateString();
        if (date.toDateString() === today.toDateString()) key = "Today";
        else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";

        if (!acc[key]) acc[key] = [];
        acc[key].push(note);
        return acc;
    }, {});

    return (
        <div className="max-w-3xl mx-auto min-h-[calc(100vh-140px)] animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-[var(--border-color)] pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-1">
                        <Bell className="text-[#1d9bf0]" /> Notifications
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">Stay updated with your academic life</p>
                </div>

                <div className="flex items-center gap-4 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] shadow-sm">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "all" ? "bg-[#1d9bf0] text-white shadow-lg shadow-blue-500/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab("unread")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "unread" ? "bg-[#1d9bf0] text-white shadow-lg shadow-blue-500/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                    >
                        Unread
                    </button>
                </div>

                <div className="flex-1 md:flex-none flex justify-end">
                    <button
                        onClick={handleMarkAllRead}
                        className="text-[#1d9bf0] text-sm hover:underline flex items-center gap-1.5 font-medium disabled:opacity-50"
                        disabled={notifications.every(n => n.isRead)}
                    >
                        <CheckCheck size={16} /> Mark all as read
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-8">
                {Object.keys(groupedNotifications).length === 0 ? (
                    <div className="text-center py-20 bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] rounded-3xl animate-fade-in-up">
                        <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-[var(--text-secondary)]" size={32} />
                        </div>
                        <h3 className="text-[var(--text-primary)] font-medium text-lg">All caught up!</h3>
                        <p className="text-[var(--text-secondary)] mt-1">No new notifications to display.</p>
                    </div>
                ) : (
                    Object.entries(groupedNotifications).map(([date, notes]) => (
                        <div key={date} className="animate-fade-in-up">
                            <h3 className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider mb-4 pl-1 sticky top-0 bg-[var(--bg-primary)]/90 backdrop-blur-sm py-2 z-10">
                                {date}
                            </h3>
                            <div className="space-y-3">
                                {notes.map(note => (
                                    <div
                                        key={note._id}
                                        onClick={() => handleNotificationClick(note)}
                                        className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer overflow-hidden ${note.isRead
                                            ? "bg-[var(--bg-secondary)]/50 border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                                            : "bg-[var(--bg-secondary)] border-[#1d9bf0]/30 shadow-md hover:border-[#1d9bf0] hover:shadow-lg hover:-translate-y-0.5"
                                            }`}
                                    >
                                        {/* Status Indicator */}
                                        {!note.isRead && (
                                            <div className="absolute top-5 right-5 w-2 h-2 bg-[#1d9bf0] rounded-full shadow-[0_0_8px_#1d9bf0] animate-pulse"></div>
                                        )}

                                        <div className={`mt-0.5 p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${note.isRead ? 'bg-[var(--bg-tertiary)] grayscale opacity-70' : 'bg-[var(--bg-tertiary)] shadow-inner'}`}>
                                            {getIcon(note.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-base font-semibold mb-1 truncate pr-6 ${note.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                                                    {note.title || "New Notification"}
                                                </h4>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${note.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]/80'}`}>
                                                {note.message}
                                            </p>

                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 bg-[var(--bg-tertiary)] px-2 py-1 rounded">
                                                    <Clock size={10} />
                                                    {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {note.link && (
                                                    <span className="text-[11px] text-[#1d9bf0] flex items-center gap-0.5 font-medium group-hover:gap-1.5 transition-all">
                                                        View Details <ArrowRight size={10} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
