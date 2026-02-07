import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
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
    Trash2
} from "lucide-react";
import { academicCalendar } from "../services/academicCalendar";
import { fetchDeadlines, addDeadline, deleteDeadline } from "../services/deadlineService";

const typeConfig = {
    exam: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", shadow: "shadow-orange-500/20" },
    quiz: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", shadow: "shadow-yellow-500/20" },
    assignment: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", shadow: "shadow-blue-500/20" },
    project: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", shadow: "shadow-purple-500/20" },
    lab: { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", shadow: "shadow-cyan-500/20" },
    presentation: { color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", shadow: "shadow-pink-500/20" },
    holiday: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", shadow: "shadow-green-500/20" },
    fest: { color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", shadow: "shadow-fuchsia-500/20" },
    college: { color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", shadow: "shadow-indigo-500/20" },
    personal: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", shadow: "shadow-emerald-500/20" },
    other: { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", shadow: "shadow-gray-500/20" }
};

export default function Calendar() {
    const { user } = useOutletContext();
    const isCR = user?.role === 'cr';

    const [currentDate, setCurrentDate] = useState(new Date());
    const [deadlines, setDeadlines] = useState([]); // Dynamic from DB
    const [staticEvents, setStaticEvents] = useState([]); // Static from file
    const [semester, setSemester] = useState("even"); // "odd" or "even"
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newDeadline, setNewDeadline] = useState({
        title: "",
        type: "assignment",
        date: "",
        description: ""
    });

    useEffect(() => {
        loadDeadlines();
    }, []);

    // Update static events when semester changes
    useEffect(() => {
        if (academicCalendar[semester]) {
            // Map static events to match our Deadline object structure slightly better
            const formattedStatic = academicCalendar[semester].events.map(e => ({
                _id: `static-${e.date}-${e.title}`, // unique faux ID
                title: e.title,
                type: e.type, // 'holiday', 'fest', 'exam'
                deadline: e.date, // Map date to deadline field
                description: e.description || "Academic Calendar Event",
                isStatic: true // Flag to prevent deletion
            }));
            setStaticEvents(formattedStatic);
        }
    }, [semester]);

    const loadDeadlines = async () => {
        try {
            const res = await fetchDeadlines(user._id);
            setDeadlines(res.data);
        } catch (error) {
            console.error("Failed to load deadlines", error);
        } finally {
            setLoading(false);
        }
    };

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
            setIsModalOpen(false);
            setNewDeadline({ title: "", type: "assignment", date: "", description: "" });
        } catch (error) {
            console.error("Failed to add deadline", error);
            alert("Failed to add deadline. Check console.");
        }
    };

    const handleDelete = async (id) => {
        if (id.toString().startsWith('static-')) {
            alert("Cannot delete static academic calendar events.");
            return;
        }
        if (!window.confirm("Delete this deadline?")) return;
        try {
            await deleteDeadline(id, user._id);
            setDeadlines(deadlines.filter(d => d._id !== id));
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

    // Combine Static + Dynamic Events
    // Merge and sort by date
    const allEvents = [...staticEvents, ...deadlines].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // Filter for the current month view
    const monthEvents = allEvents.filter(d => {
        const dDate = new Date(d.deadline);
        return dDate.getMonth() === currentDate.getMonth() && dDate.getFullYear() === currentDate.getFullYear();
    });

    // Upcoming Hero Data
    const upcomingEvents = allEvents.filter(d => new Date(d.deadline) >= new Date().setHours(0, 0, 0, 0));
    const nextBigOne = upcomingEvents[0];

    return (
        <div className="min-h-screen pb-20 space-y-8 animate-fade-in text-white/90">

            {/* 🟢 HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/20">
                            Deadlines
                        </span>
                        {isCR && <span className="text-gray-500 text-xs font-mono border border-gray-800 px-1 rounded">CR ACCESS</span>}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Academic Calendar</h1>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <p>Stay ahead of every quiz, submission, and exam.</p>
                        {/* Semester Toggle */}
                        <div className="flex bg-[#16181c] rounded-lg p-0.5 border border-white/5">
                            {["odd", "even"].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSemester(s)}
                                    className={`px-3 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${semester === s ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {s} Sem
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-blue-50 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add Event
                </button>
            </header>

            {/* 🟢 HERO: NEXT DEADLINE */}
            {nextBigOne ? (
                <CountdownHero event={nextBigOne} />
            ) : (
                <div className="bg-[#0f1419] border border-gray-800 rounded-3xl p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">All Clear!</h3>
                    <p className="text-gray-400 text-sm mt-2">No upcoming academic events or deadlines.</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 🟢 MAIN CALENDAR GRID */}
                <div className="lg:col-span-8 bg-[#09090b] p-8 rounded-[32px] border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="py-2">{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(startDay)].map((_, i) => <div key={`empty-${i}`} />)}
                        {[...Array(daysInMonth)].map((_, i) => {
                            const day = i + 1;
                            const today = new Date();
                            const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                            // Check for events on this day
                            const dayEvents = monthEvents.filter(d => new Date(d.deadline).getDate() === day);
                            const hasEvent = dayEvents.length > 0;
                            const mainEvent = dayEvents[0]; // Just show first one's color for dot
                            const style = mainEvent ? (typeConfig[mainEvent.type] || typeConfig.other) : null;

                            return (
                                <div key={day} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative group hover:bg-white/5 transition-colors cursor-pointer border ${isToday ? 'border-blue-500 bg-blue-500/10' : 'border-transparent'}`}>
                                    <span className={`text-sm ${isToday ? 'font-bold text-blue-400' : 'text-gray-300'}`}>{day}</span>
                                    {hasEvent && (
                                        <div className="flex gap-1 mt-1 justify-center">
                                            {dayEvents.slice(0, 3).map((ev, idx) => {
                                                const evStyle = typeConfig[ev.type] || typeConfig.other;
                                                return <div key={idx} className={`w-1.5 h-1.5 rounded-full ${evStyle.bg.replace('/10', '')}`} />
                                            })}
                                        </div>
                                    )}

                                    {/* Tooltip */}
                                    {hasEvent && (
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#16181c] border border-gray-700 p-2 rounded-xl shadow-xl z-20 min-w-[150px]">
                                            {dayEvents.map(ev => (
                                                <div key={ev._id} className="text-xs text-gray-300 mb-1 last:mb-0 border-l-2 pl-2 border-gray-600">
                                                    <span className="font-bold block text-white">{ev.title}</span>
                                                    <span className="text-[10px] opacity-70 capitalize">{ev.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 🟢 UPCOMING TIMELINE */}
                <div className="lg:col-span-4 bg-[#09090b] p-6 rounded-[32px] border border-white/5 h-fit max-h-[600px] overflow-y-auto custom-scrollbar">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 sticky top-0 bg-[#09090b] z-10 py-2">
                        <Clock className="text-blue-500" size={18} /> Timeline
                    </h3>

                    <div className="space-y-4 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-800"></div>

                        {upcomingEvents.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No upcoming deadlines.</p>}

                        {upcomingEvents.map((item, idx) => {
                            const config = typeConfig[item.type] || typeConfig.other;
                            const daysLeft = Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                            const isUrgent = daysLeft <= 2;

                            return (
                                <div key={item._id} className="relative pl-10 group">
                                    {/* Dot */}
                                    <div className={`absolute left-[14px] top-4 w-3 h-3 rounded-full border-2 border-[#09090b] ${config.bg.replace('/10', '')} z-10`}></div>

                                    <div className={`bg-[#16181c] p-4 rounded-2xl border ${isUrgent ? 'border-red-500/30' : 'border-gray-800'} hover:border-gray-600 transition-all group-hover:-translate-y-1 relative`}>
                                        {/* Show delete for CR OR for Personal tasks created by me */}
                                        {(isCR || (item.type === 'personal' && item.createdBy === user._id)) && !item.isStatic && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                                                className="absolute top-2 right-2 p-1.5 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}

                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                                                {item.type}
                                            </span>
                                            {isUrgent && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><Flame size={10} /> URGENT</span>}
                                        </div>
                                        <h4 className="font-bold text-sm text-white mb-1">{item.title}</h4>
                                        <p className="text-gray-500 text-xs mb-2 line-clamp-2">{item.description}</p>
                                        <div className="text-xs text-gray-400 font-mono">
                                            Due: {new Date(item.deadline).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>

            {/* 🟢 ADD DEADLINE MODAL (CR ONLY) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#09090b] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h2 className="text-lg font-bold text-white">Add Deadline</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-500 hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Title</label>
                                <input
                                    className="w-full bg-[#16181c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm font-medium"
                                    placeholder="e.g. Physics Mid-Sem"
                                    value={newDeadline.title}
                                    onChange={e => setNewDeadline({ ...newDeadline, title: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Type</label>
                                    <select
                                        className="w-full bg-[#16181c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm appearance-none disabled:opacity-50"
                                        value={isCR ? newDeadline.type : "personal"}
                                        onChange={e => setNewDeadline({ ...newDeadline, type: e.target.value })}
                                        disabled={!isCR}
                                    >
                                        {isCR ? (
                                            Object.keys(typeConfig).map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)
                                        ) : (
                                            <option value="personal">Personal</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Deadline</label>
                                    <input
                                        type="date"
                                        className="w-full bg-[#16181c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                        value={newDeadline.date}
                                        onChange={e => setNewDeadline({ ...newDeadline, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea
                                    className="w-full bg-[#16181c] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm resize-none h-20"
                                    placeholder="Details..."
                                    value={newDeadline.description}
                                    onChange={e => setNewDeadline({ ...newDeadline, description: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2 transition-colors">
                                Publish Deadline
                            </button>
                        </form>
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
        <div className={`relative overflow-hidden rounded-[32px] p-8 md:p-12 mb-8 group transition-all duration-500 border border-white/5`}>
            {/* Dynamic Background */}
            <div className={`absolute inset-0 bg-gradient-to-br from-black via-[#09090b] to-black z-0`}></div>
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${config.bg.replace('/10', '/5')} rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000`}></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${config.bg} ${config.color} ${config.border} flex items-center gap-1.5`}>
                            <AlertTriangle size={12} /> Upcoming {event.type}
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight group-hover:scale-[1.01] transition-transform origin-left">
                        {event.title}
                    </h2>
                    <p className="text-gray-400 max-w-lg text-lg leading-relaxed">
                        {event.description || "Prepare yourself. The deadline is approaching fast."}
                    </p>
                    <div className="mt-6 flex items-center gap-4 text-sm font-mono text-gray-500">
                        <span className="flex items-center gap-2"><Clock size={16} /> Due: {new Date(event.deadline).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Big Countdown */}
                <div className="flex gap-4">
                    <TimeBox val={timeLeft.days} label="Days" color={config.color} />
                    <div className="text-4xl font-thin text-gray-700 flex items-center pb-4">:</div>
                    <TimeBox val={timeLeft.hours} label="Hours" color={config.color} />
                </div>
            </div>
        </div>
    )
}

function TimeBox({ val, label, color }) {
    return (
        <div className="bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[100px] text-center shadow-2xl">
            <span className={`block text-5xl font-black ${color} tracking-tighter tabular-nums`}>{val}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 block">{label}</span>
        </div>
    )
}
