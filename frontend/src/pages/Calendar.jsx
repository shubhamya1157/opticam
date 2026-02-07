import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Zap,
    Star,
    X,
    Plus,
    Flame,
    AlertTriangle,
    Trash2,
    Filter,
    RotateCcw,
    GraduationCap,
    PartyPopper,
    Briefcase,
    Video,
    Coffee,
    School,
    User,
    Trophy,
    Award
} from "lucide-react";
import { academicCalendar } from "../services/academicCalendar";
import { fetchDeadlines, addDeadline, deleteDeadline } from "../services/deadlineService";

const typeConfig = {
    exam: {
        icon: <GraduationCap size={16} />,
        label: "Examination",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        shadow: "shadow-orange-500/10",
        gradient: "from-orange-500/20 to-red-500/5"
    },
    quiz: {
        icon: <Zap size={16} />,
        label: "Quiz",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        shadow: "shadow-yellow-500/10",
        gradient: "from-yellow-500/20 to-orange-500/5"
    },
    assignment: {
        icon: <Briefcase size={16} />,
        label: "Assignment",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        shadow: "shadow-blue-500/10",
        gradient: "from-blue-500/20 to-cyan-500/5"
    },
    project: {
        icon: <Trophy size={16} />,
        label: "Project",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        shadow: "shadow-purple-500/10",
        gradient: "from-purple-500/20 to-pink-500/5"
    },
    lab: {
        icon: <Flame size={16} />,
        label: "Lab",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        shadow: "shadow-cyan-500/10",
        gradient: "from-cyan-500/20 to-blue-500/5"
    },
    presentation: {
        icon: <Video size={16} />,
        label: "Presentation",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20",
        shadow: "shadow-pink-500/10",
        gradient: "from-pink-500/20 to-rose-500/5"
    },
    holiday: {
        icon: <Coffee size={16} />,
        label: "Holiday",
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        shadow: "shadow-green-500/10",
        gradient: "from-green-500/20 to-emerald-500/5"
    },
    fest: {
        icon: <PartyPopper size={16} />,
        label: "Festival",
        color: "text-fuchsia-400",
        bg: "bg-fuchsia-500/10",
        border: "border-fuchsia-500/20",
        shadow: "shadow-fuchsia-500/10",
        gradient: "from-fuchsia-500/20 to-purple-500/5"
    },
    college: {
        icon: <School size={16} />,
        label: "Academic",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        shadow: "shadow-indigo-500/10",
        gradient: "from-indigo-500/20 to-violet-500/5"
    },
    personal: {
        icon: <User size={16} />,
        label: "Personal",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        shadow: "shadow-emerald-500/10",
        gradient: "from-emerald-500/20 to-teal-500/5"
    },
    other: {
        icon: <Star size={16} />,
        label: "Other",
        color: "text-gray-400",
        bg: "bg-gray-500/10",
        border: "border-gray-500/20",
        shadow: "shadow-gray-500/10",
        gradient: "from-gray-500/20 to-slate-500/5"
    }
};

export default function Calendar() {
    const { user } = useOutletContext();
    const isCR = user?.role === 'cr';

    const [currentDate, setCurrentDate] = useState(new Date());
    const [deadlines, setDeadlines] = useState([]);
    const [staticEvents, setStaticEvents] = useState([]);
    const [semester, setSemester] = useState("even");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null); // For Detail Modal
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState([]); // Filter state

    // Form State
    const [newDeadline, setNewDeadline] = useState({
        title: "",
        type: "assignment",
        date: "",
        description: ""
    });

    const loadDeadlines = async () => {
        if (!user?._id) return;
        try {
            const res = await fetchDeadlines(user._id);
            setDeadlines(res.data);
        } catch (error) {
            console.error("Failed to load deadlines", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) loadDeadlines();
    }, [user]);

    useEffect(() => {
        if (academicCalendar[semester]) {
            const formattedStatic = academicCalendar[semester].events.map(e => ({
                _id: `static-${e.date}-${e.title}`,
                title: e.title,
                type: e.type,
                deadline: e.date,
                description: e.description || "Academic Calendar Event",
                isStatic: true
            }));
            setStaticEvents(formattedStatic);
        }
    }, [semester]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newDeadline.title || !newDeadline.date) return;

        try {
            const res = await addDeadline({
                ...newDeadline,
                deadline: newDeadline.date,
                userId: user._id
            });
            setDeadlines([...deadlines, res.data].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)));
            setIsAddModalOpen(false);
            setNewDeadline({ title: "", type: "assignment", date: "", description: "" });
        } catch (error) {
            console.error("Failed to add deadline", error);
            alert("Failed to add deadline.");
        }
    };

    const handleDelete = async (id) => {
        if (id.toString().startsWith('static-')) return;
        if (!window.confirm("Delete this deadline?")) return;

        try {
            await deleteDeadline(id, user._id);
            setDeadlines(deadlines.filter(d => d._id !== id));
            setSelectedEvent(null); // Close modal if open
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    // Calendar Logic
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDay = monthStart.getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Event Filter & Merge
    const allEvents = [...staticEvents, ...deadlines].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const filteredEvents = activeFilters.length > 0
        ? allEvents.filter(e => activeFilters.includes(e.type))
        : allEvents;

    const monthEvents = filteredEvents.filter(d => {
        const dDate = new Date(d.deadline);
        return dDate.getMonth() === currentDate.getMonth() && dDate.getFullYear() === currentDate.getFullYear();
    });

    const upcomingEvents = filteredEvents.filter(d => new Date(d.deadline) >= new Date().setHours(0, 0, 0, 0));
    const nextBigOne = upcomingEvents[0];

    const toggleFilter = (type) => {
        setActiveFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    return (
        <div className="min-h-screen pb-20 space-y-8 animate-fade-in text-[var(--text-primary)]">

            {/* 🟢 HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-1">
                            <CalendarIcon size={10} className="text-white" /> Planning Console
                        </span>
                        {isCR && <span className="text-[var(--text-secondary)] text-xs font-mono border border-[var(--border-color)] px-1 rounded">COMMANDER MODE</span>}
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-[var(--text-primary)] mb-1">Academic Timeline</h1>
                    <p className="text-[var(--text-secondary)] text-sm">Synchronize your objectives. Stay ahead.</p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end items-center">
                    {/* Semester Toggle */}
                    <div className="bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] flex shadow-sm">
                        {["odd", "even"].map(s => (
                            <button
                                key={s}
                                onClick={() => setSemester(s)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${semester === s ? 'bg-[var(--accent-blue)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                {s} Sem
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-[var(--accent-blue)] hover:opacity-90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={18} /> New Event
                    </button>
                </div>
            </header>

            {/* 🟢 FILTER BAR */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest mr-2">
                    <Filter size={14} /> Filters:
                </div>
                {Object.keys(typeConfig).map(type => {
                    const isActive = activeFilters.includes(type);
                    const config = typeConfig[type];
                    return (
                        <button
                            key={type}
                            onClick={() => toggleFilter(type)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${isActive
                                ? `${config.bg} ${config.color} ${config.border} shadow-md`
                                : `border-transparent bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]`
                                }`}
                        >
                            {isActive && config.icon && React.cloneElement(config.icon, { size: 12 })}
                            {config.label}
                        </button>
                    );
                })}
                {activeFilters.length > 0 && (
                    <button onClick={() => setActiveFilters([])} className="text-xs text-red-400 hover:text-red-300 ml-2">Clear</button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 🟢 UPCOMING / HERO */}
                <div className="lg:col-span-4 space-y-6">
                    {nextBigOne ? (
                        <CountdownHero event={nextBigOne} />
                    ) : (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-8 text-center h-64 flex flex-col items-center justify-center">
                            <Star className="text-[var(--text-secondary)] mb-4" size={32} />
                            <h3 className="text-lg font-bold text-[var(--text-secondary)]">All Systems Normal</h3>
                            <p className="text-[var(--text-secondary)] text-xs mt-1">No impending deadlines detected.</p>
                        </div>
                    )}

                    {/* Timeline List */}
                    <div className="bg-[var(--bg-secondary)] rounded-[32px] border border-[var(--border-color)] h-[400px] flex flex-col relative overflow-hidden">
                        <div className="p-6 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] z-20 flex justify-between items-center shadow-sm">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Clock size={14} className="text-[var(--accent-blue)]" /> Incoming</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-3 custom-scrollbar">
                            {upcomingEvents.slice(0, 10).map((item) => {
                                const config = typeConfig[item.type] || typeConfig.other;
                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => setSelectedEvent(item)}
                                        className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--accent-blue)]/30 cursor-pointer transition-all hover:translate-x-1 group flex items-start gap-4"
                                    >
                                        {/* Icon Box */}
                                        <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center ${config.bg} ${config.color} border ${config.border}`}>
                                            {config.icon && React.cloneElement(config.icon, { size: 14 })}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)] font-mono">{new Date(item.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors line-clamp-1">{item.title}</h4>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 🟢 MAIN CALENDAR GRID */}
                <div className="lg:col-span-8 bg-[var(--bg-secondary)] p-8 rounded-[32px] border border-[var(--border-color)] relative shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-2">
                            {currentDate.toLocaleString('default', { month: 'long' })}
                            <span className="text-[var(--text-secondary)] text-xl font-medium">{currentDate.getFullYear()}</span>
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={goToToday} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors text-[var(--accent-blue)]" title="Today"><RotateCcw size={18} /></button>
                            <div className="w-px h-8 bg-[var(--border-color)] mx-2"></div>
                            <button onClick={prevMonth} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors text-[var(--text-primary)]"><ChevronLeft size={20} /></button>
                            <button onClick={nextMonth} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors text-[var(--text-primary)]"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-4 text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="py-2">{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(startDay)].map((_, i) => <div key={`empty-${i}`} />)}
                        {[...Array(daysInMonth)].map((_, i) => {
                            const day = i + 1;
                            const today = new Date();
                            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                            const dayEvents = monthEvents.filter(d => new Date(d.deadline).getDate() === day);
                            const hasEvent = dayEvents.length > 0;

                            return (
                                <div
                                    key={day}
                                    onClick={() => hasEvent && setSelectedEvent(dayEvents[0])} // Opens first event for now, could be improved to show list
                                    className={`
                                        aspect-square rounded-2xl flex flex-col items-center justify-between p-2 relative group transition-all duration-300
                                        ${isToday ? 'bg-[var(--accent-blue)]/10 ring-1 ring-[var(--accent-blue)]/50 shadow-inner' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-transparent hover:border-[var(--border-color)]'}
                                        ${hasEvent ? 'cursor-pointer hover:scale-[1.05]' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isToday ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{day}</span>

                                    {hasEvent && (
                                        <div className="w-full flex flex-col gap-1 items-center">
                                            <div className="flex -space-x-1 items-center">
                                                {dayEvents.slice(0, 3).map((ev, idx) => {
                                                    const config = typeConfig[ev.type] || typeConfig.other;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`w-4 h-4 rounded-full ring-2 ring-[var(--bg-tertiary)] flex items-center justify-center ${config.bg} text-[8px] border ${config.border}`}
                                                            title={ev.title}
                                                        >
                                                            {config.icon && React.cloneElement(config.icon, { size: 8, className: config.color })}
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="w-4 h-4 rounded-full ring-2 ring-[var(--bg-tertiary)] bg-[var(--bg-primary)] text-[8px] flex items-center justify-center font-bold text-[var(--text-secondary)]">+{dayEvents.length - 3}</div>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-[var(--text-secondary)] font-medium truncate w-full text-center hidden md:block group-hover:text-[var(--text-primary)] transition-colors">
                                                {dayEvents[0].title}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* 🟢 ADD DEADLINE MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-[32px] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]/30">
                            <div>
                                <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-wide">New Event</h2>
                                <p className="text-[var(--text-secondary)] text-xs">Add to your academic timeline</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] p-2 rounded-full transition-colors"><X size={18} className="text-[var(--text-primary)]" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Title</label>
                                <input
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] text-sm font-medium transition-colors"
                                    placeholder="e.g. Physics Mid-Sem"
                                    value={newDeadline.title}
                                    onChange={e => setNewDeadline({ ...newDeadline, title: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Type</label>
                                    <select
                                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] text-sm appearance-none disabled:opacity-50"
                                        value={isCR ? newDeadline.type : "personal"}
                                        onChange={e => setNewDeadline({ ...newDeadline, type: e.target.value })}
                                        disabled={!isCR}
                                    >
                                        {isCR ? (
                                            Object.keys(typeConfig).map(k => <option key={k} value={k}>{typeConfig[k].label}</option>)
                                        ) : (
                                            <option value="personal">Personal</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] text-sm"
                                        value={newDeadline.date}
                                        onChange={e => setNewDeadline({ ...newDeadline, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">Description</label>
                                <textarea
                                    className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] text-sm resize-none h-24"
                                    placeholder="Additional details..."
                                    value={newDeadline.description}
                                    onChange={e => setNewDeadline({ ...newDeadline, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-[var(--accent-blue)] hover:opacity-90 text-white font-bold rounded-xl mt-2 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-wider text-xs">
                                Publish Event
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 🟢 EVENT DETAILS MODAL */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0" onClick={() => setSelectedEvent(null)}></div>
                    <div className="bg-[var(--bg-secondary)] w-full max-w-lg rounded-[40px] border border-[var(--border-color)] shadow-2xl relative overflow-hidden animate-scale-in">
                        {(() => {
                            const config = typeConfig[selectedEvent.type] || typeConfig.other;
                            return (
                                <>
                                    {/* Header Background */}
                                    <div className={`h-40 bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
                                        {/* Giant Icon in background */}
                                        <div className="absolute -right-6 -top-6 text-white/5 rotate-12">
                                            {config.icon && React.cloneElement(config.icon, { size: 180 })}
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent"></div>

                                        <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 bg-black/20 hover:bg-black/40 p-2 rounded-full text-white backdrop-blur-md transition-colors"><X size={20} /></button>
                                    </div>

                                    <div className="p-8 -mt-20 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl mb-6 bg-gradient-to-br ${config.gradient} border border-white/10`}>
                                            {config.icon && React.cloneElement(config.icon, { size: 32 })}
                                        </div>

                                        <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border shadow-xl ${config.bg} ${config.color} ${config.border}`}>
                                            {config.label}
                                        </span>

                                        <h2 className="text-3xl font-black text-[var(--text-primary)] leading-tight mb-2">{selectedEvent.title}</h2>
                                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8 border-l-2 border-[var(--border-color)] pl-4">
                                            {selectedEvent.description || "No specific details provided for this event."}
                                        </p>

                                        <div className="bg-[var(--bg-tertiary)] rounded-2xl p-6 border border-[var(--border-color)] space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-[var(--text-primary)]">
                                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><CalendarIcon size={18} /></div>
                                                    <span className="font-mono text-sm">{new Date(selectedEvent.deadline).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                </div>
                                                <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest">Date</div>
                                            </div>

                                            <div className="h-px bg-[var(--border-color)]"></div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-[var(--text-primary)]">
                                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Clock size={18} /></div>
                                                    <span className="font-mono text-sm">All Day Event</span>
                                                </div>
                                                <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest">Time</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-8 flex gap-3">
                                            <button onClick={() => setSelectedEvent(null)} className="flex-1 py-3 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-bold text-xs uppercase tracking-wider transition-colors">
                                                Close
                                            </button>
                                            {(isCR || (selectedEvent.type === 'personal' && selectedEvent.createdBy === user._id)) && !selectedEvent.isStatic && (
                                                <button
                                                    onClick={() => handleDelete(selectedEvent._id)}
                                                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

        </div>
    );
}

function CountdownHero({ event }) {
    const config = typeConfig[event.type] || typeConfig.other;
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const diff = +new Date(event.deadline) - +new Date();
        if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            mins: Math.floor((diff / 1000 / 60) % 60),
        };
    }

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
        return () => clearInterval(timer);
    }, [event]);

    return (
        <div className={`relative overflow-hidden rounded-[40px] p-8 min-h-[400px] flex flex-col justify-between group transition-all duration-500 border border-[var(--border-color)] shadow-2xl`}>
            {/* Dynamic Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-secondary)] to-[var(--bg-primary)] z-0`}></div>
            <div className={`absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br ${config.gradient} opacity-20 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000`}></div>

            {/* Giant Background Icon */}
            <div className={`absolute -right-10 -bottom-10 opacity-5 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110`}>
                {config.icon && React.cloneElement(config.icon, { size: 300, className: "text-[var(--text-primary)]" })}
            </div>


            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg flex items-center gap-2 ${config.bg} ${config.color} ${config.border}`}>
                        {config.icon && React.cloneElement(config.icon, { size: 12 })}
                        Next Objective
                    </span>
                </div>
                <h2 className="text-5xl font-black text-[var(--text-primary)] mb-4 tracking-tighter leading-[1.1]">
                    {event.title}
                </h2>
                <p className="text-[var(--text-secondary)] max-w-xs text-sm leading-relaxed border-l-2 border-[var(--border-color)] pl-4">
                    {event.description || "Prepare yourself. The deadline is approaching fast."}
                </p>
            </div>

            <div className="relative z-10 mt-8">
                <div className="flex gap-2">
                    <TimeBox val={timeLeft.days} label="Days" />
                    <TimeBox val={timeLeft.hours} label="Hours" />
                    <TimeBox val={timeLeft.mins} label="Mins" />
                </div>
            </div>
        </div>
    )
}

function TimeBox({ val, label }) {
    return (
        <div className="bg-[var(--bg-tertiary)]/80 border border-[var(--border-color)] backdrop-blur-md rounded-2xl flex-1 py-4 text-center">
            <span className={`block text-3xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums`}>{val}</span>
            <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-bold block opacity-60">{label}</span>
        </div>
    )
}
