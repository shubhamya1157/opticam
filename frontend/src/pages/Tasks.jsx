import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
    Plus,
    Clock,
    Trophy,
    Trash2,
    CheckCircle2,
    Target,
    Zap,
    X,
    AlertCircle,
    Calendar,
    ChevronRight,
    Flame,
    Sparkles
} from "lucide-react";
import {
    fetchTasks,
    addTask,
    completeTask,
    deleteTask
} from "../services/taskService";

const priorityConfig = {
    high: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-500/10" },
    medium: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", glow: "shadow-yellow-500/10" },
    low: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/10" }
};

export default function Tasks() {
    const navigate = useNavigate();
    const { user, handleUpdateUser } = useOutletContext();

    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState("daily"); // daily, weekly, monthly
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState("");
    const [type, setType] = useState("daily");
    const [priority, setPriority] = useState("medium");
    const [hours, setHours] = useState(1);
    const [minutes, setMinutes] = useState(0);
    const [note, setNote] = useState("");

    useEffect(() => {
        if (user?._id) {
            loadTasks();
        }
    }, [user]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const res = await fetchTasks(user._id);
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to load tasks", error);
        } finally {
            setLoading(false);
        }
    };

    // Derived State
    const filteredTasks = tasks.filter(t => t.type === filter && !t.completed);

    // Stats should reflect ALL active missions, not just the filtered view
    const allActiveTasks = tasks.filter(t => !t.completed);
    const activeTasksCount = allActiveTasks.length;
    const totalDuration = allActiveTasks.reduce((acc, t) => acc + t.duration, 0);

    // Calculate Progress (Mocked for now since completed tasks disappear, but typically tracking completed vs total)
    // For this UI, let's show "Tasks Cleared Today" if we tracked history, but here we show Active load.
    // Let's make a "Daily Load" indicator.

    const handleAdd = async () => {
        if (!title) return;
        const duration = hours * 60 + minutes;
        const res = await addTask({
            userId: user._id,
            title,
            type,
            priority,
            duration,
            note
        });
        setTasks([res.data, ...tasks]);
        setShowAdd(false);
        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setNote("");
        setHours(1);
        setMinutes(0);
        setPriority("medium");
        setType(filter);
    };

    const handleComplete = async (id) => {
        const { data } = await completeTask(id);
        if (data.user) {
            handleUpdateUser(data.user);
        }
        setTasks(tasks.filter(t => t._id !== id));
    };

    const handleDelete = async (id) => {
        await deleteTask(id);
        setTasks(tasks.filter(t => t._id !== id));
    };

    return (
        <div className="min-h-screen space-y-8 animate-fade-in pb-20">

            {/* 🟢 HEADER: MISSION CONTROL */}
            <div className="flex flex-col md:flex-row gap-6 items-stretch">

                {/* Left: Welcome & Daily Status */}
                <div className="flex-1 bg-[#09090b] border border-white/5 rounded-[32px] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-600/10 transition-colors duration-500"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                    Mission Control
                                </span>
                                <span className="text-gray-500 text-xs font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                                Ready for Impact?
                            </h1>
                            <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                                You have <span className="text-white font-bold">{tasks.length} active missions</span> across all frequencies.
                                Stay focused and clear your objectives.
                            </p>
                        </div>
                    </div>

                    {/* 🔹 PREMIUM GLASSMORPHIC STATS GRID */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        {/* PENDING TASKS CARD */}
                        <div className="relative group overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-28 transform transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/20 shadow-lg shadow-blue-900/5">
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Target size={40} />
                            </div>

                            <span className="text-[#71767b] text-[10px] font-bold uppercase tracking-widest z-10">Pending Tasks</span>

                            <div className="z-10">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">{activeTasksCount}</span>
                                    <span className="text-xs font-bold text-blue-400 tracking-wider">ACTIVE</span>
                                </div>
                            </div>

                            {/* Glow */}
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-500/20 blur-[40px] rounded-full group-hover:bg-blue-500/30 transition-colors"></div>
                        </div>

                        {/* ESTIMATED TIME CARD */}
                        <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-28 transform transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/20 shadow-lg shadow-indigo-900/5">
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Clock size={40} />
                            </div>

                            <span className="text-[#71767b] text-[10px] font-bold uppercase tracking-widest z-10">Estimated Time</span>

                            <div className="z-10">
                                <div className="flex items-baseline gap-2 text-white">
                                    <span className="text-4xl font-black tracking-tighter drop-shadow-lg">
                                        {Math.floor(totalDuration / 60)}
                                        <span className="text-sm font-bold text-gray-500 ml-1 mr-3">H</span>
                                        {totalDuration % 60}
                                        <span className="text-sm font-bold text-gray-500 ml-1">M</span>
                                    </span>
                                </div>
                            </div>

                            {/* Glow */}
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-500/20 blur-[40px] rounded-full group-hover:bg-purple-500/30 transition-colors"></div>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Action */}
                <div onClick={() => setShowAdd(true)} className="md:w-1/3 bg-gradient-to-br from-[#1d9bf0] to-blue-700 rounded-[32px] p-8 relative overflow-hidden cursor-pointer group shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-[50px] group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Plus className="text-white" size={24} />
                            </div>
                            <div className="bg-black/20 px-3 py-1 rounded-full text-[10px] font-bold text-white/80 uppercase tracking-widest backdrop-blur-sm">
                                Create
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">New Mission</h3>
                            <p className="text-blue-100 text-xs font-medium">Add a task to your queue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🟢 CONTROLS: FILTER SEGMENT */}
            <div className="flex justify-center">
                <div className="bg-[#09090b] border border-white/5 p-1.5 rounded-2xl flex gap-1 relative overflow-hidden shadow-lg">
                    {['daily', 'weekly', 'monthly'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative z-10 ${filter === f ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {f}
                            {filter === f && (
                                <div className="absolute inset-0 bg-white/10 rounded-xl border border-white/5 shadow-inner -z-10 animate-scale-in"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🟢 TASK GRID */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin text-blue-500"><Zap /></div>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-[#09090b] rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-2xl relative">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl"></div>
                        <Trophy size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">All Clear, Commander</h3>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                        You have no active {filter} missions. Enjoy your downtime or prep for the next cycle.
                    </p>
                    <button onClick={() => setShowAdd(true)} className="mt-8 text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">
                        + Assign New Mission
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task) => {
                        const style = priorityConfig[task.priority] || priorityConfig.medium;
                        return (
                            <div key={task._id} className="group relative bg-[#09090b] border border-[#2f3336] rounded-2xl p-5 hover:border-[#1d9bf0]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#1d9bf0]/5 overflow-hidden flex flex-col">

                                {/* Priority Badge & Delete */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-2.5 py-1 rounded-full border ${style.bg} ${style.border} ${style.color} text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${style.bg.replace('/10', '')} animate-pulse`}></div>
                                        {task.priority}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(task._id)}
                                        className="text-[#71767b] hover:text-red-500 transition-colors p-1 rounded-full hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Title & Note */}
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-[#1d9bf0] transition-colors line-clamp-2">
                                        {task.title}
                                    </h3>
                                    {task.note && (
                                        <p className="text-[#71767b] text-xs leading-relaxed mb-4 line-clamp-2">
                                            {task.note}
                                        </p>
                                    )}

                                    {/* Creation Date Badge */}
                                    <div className="flex items-center gap-1.5 mb-2 w-fit bg-[#1d9bf0]/5 px-2 py-1 rounded text-[10px] text-[#1d9bf0] font-medium border border-[#1d9bf0]/10">
                                        <Calendar size={10} />
                                        <span>{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                {/* Footer: Duration & Complete */}
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2f3336]">
                                    <div className="flex items-center gap-2 text-[#71767b] text-xs font-medium">
                                        <Clock size={12} className="text-[#1d9bf0]" />
                                        <span>{Math.floor(task.duration / 60)}h {task.duration % 60}m</span>
                                    </div>

                                    <button
                                        onClick={() => handleComplete(task._id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1d9bf0]/10 text-[#1d9bf0] hover:bg-[#1d9bf0] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wide border border-[#1d9bf0]/20"
                                    >
                                        <CheckCircle2 size={12} />
                                        Complete
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* 🟢 ADD TASK MODAL (PREMIUM) */}
            {showAdd && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setShowAdd(false)}></div>

                    <div className="bg-[#09090b] w-full max-w-lg rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden animate-scale-in">
                        {/* Header */}
                        <div className="p-8 pb-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wide">New Directive</h2>
                                <p className="text-gray-500 text-xs mt-1">Add a new task to your schedule.</p>
                            </div>
                            <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-8 space-y-6">
                            {/* Title */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Mission Title</label>
                                <input
                                    className="w-full bg-[#16181c] border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                                    placeholder="e.g. Complete System Architecture"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            {/* Priority & Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Priority Level</label>
                                    <div className="flex bg-[#16181c] rounded-xl p-1 gap-1">
                                        {['low', 'medium', 'high'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setPriority(p)}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${priority === p ? 'bg-[#2f3336] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Frequency</label>
                                    <div className="flex bg-[#16181c] rounded-xl p-1 gap-1">
                                        {['daily', 'weekly', 'monthly'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setType(t)}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${type === t ? 'bg-[#2f3336] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {t.slice(0, 1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2 block">Estimated Duration</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-[#16181c] border border-white/5 rounded-xl px-4 py-2 flex items-center justify-between">
                                        <span className="text-gray-500 text-xs font-bold">HOURS</span>
                                        <input type="number" min="0" max="24" value={hours} onChange={e => setHours(+e.target.value)} className="bg-transparent text-white font-mono text-lg text-right w-16 focus:outline-none" />
                                    </div>
                                    <div className="flex-1 bg-[#16181c] border border-white/5 rounded-xl px-4 py-2 flex items-center justify-between">
                                        <span className="text-gray-500 text-xs font-bold">MINS</span>
                                        <input type="number" min="0" max="59" value={minutes} onChange={e => setMinutes(+e.target.value)} className="bg-transparent text-white font-mono text-lg text-right w-16 focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={handleAdd}
                                disabled={!title}
                                className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg ${title ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20' : 'bg-[#16181c] text-gray-500 cursor-not-allowed'}`}
                            >
                                Confirm Mission
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
