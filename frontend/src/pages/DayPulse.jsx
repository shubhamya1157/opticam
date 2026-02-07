import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { PieChart, Clock, Zap, Moon, Coffee, Briefcase, Plus, Trash2, Check, TrendingUp, AlertCircle } from "lucide-react";

export default function DayPulse() {
    const { user, onUpdateUser } = useOutletContext();
    const [routine, setRoutine] = useState(user.dailyRoutine || []);
    const [newItem, setNewItem] = useState({ activity: "", startTime: "", endTime: "", color: "#3b82f6", category: "productive" });
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ productive: 0, fixed: 0, rest: 0, leisure: 0, free: 0 });

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];
    const categories = [
        { id: 'fixed', label: 'Fixed', icon: <Briefcase size={14} />, desc: "Non-negotiable (Classes, Sleep)" },
        { id: 'productive', label: 'Productive', icon: <Zap size={14} />, desc: "High-value work (Study, Gym)" },
        { id: 'rest', label: 'Rest', icon: <Moon size={14} />, desc: "Recharging (Breaks, Meals)" },
        { id: 'leisure', label: 'Leisure', icon: <Coffee size={14} />, desc: "Fun & Entertainment" },
    ];

    useEffect(() => {
        calculateStats();
    }, [routine]);

    const calculateStats = () => {
        let totals = { productive: 0, fixed: 0, rest: 0, leisure: 0, occupied: 0 };

        routine.forEach(item => {
            const [sH, sM] = item.startTime.split(':').map(Number);
            const [eH, eM] = item.endTime.split(':').map(Number);
            let duration = (eH * 60 + eM) - (sH * 60 + sM);
            if (duration < 0) duration += 1440;

            if (totals[item.category] !== undefined) {
                totals[item.category] += duration;
            }
            totals.occupied += duration;
        });

        setStats({
            ...totals,
            free: 1440 - totals.occupied
        });
    };

    const handleAdd = () => {
        if (!newItem.activity || !newItem.startTime || !newItem.endTime) return;
        setRoutine([...routine, newItem]);
        setNewItem({ ...newItem, activity: "" }); // Reset activity but keep time/cat for faster entry
    };

    const handleDelete = (index) => {
        setRoutine(routine.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/auth/update-routine", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, routine })
            });
            const updatedUser = await res.json();
            onUpdateUser(updatedUser);
            // Optional: Show success toast
        } catch (err) {
            console.error("Failed to save", err);
        } finally {
            setLoading(false);
        }
    };

    // Generate Conic Gradient for the big ring
    const getConicGradient = () => {
        if (routine.length === 0) return `conic-gradient(#16181c 0deg, #16181c 360deg)`;

        const sorted = [...routine].sort((a, b) => a.startTime.localeCompare(b.startTime));
        let parts = [];

        sorted.forEach(item => {
            const [sH, sM] = item.startTime.split(':').map(Number);
            const [eH, eM] = item.endTime.split(':').map(Number);

            let startDeg = ((sH * 60 + sM) / 1440) * 360;
            let endDeg = ((eH * 60 + eM) / 1440) * 360;
            if (endDeg < startDeg) endDeg += 360;

            parts.push(`${item.color} ${startDeg}deg ${endDeg}deg`);
        });

        return `conic-gradient(from 0deg, ${parts.join(', ')}, #16181c 0deg)`;
    };

    return (
        <div className="min-h-screen space-y-8 p-8 animate-fade-in relative z-10">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight font-['Outfit'] mb-2">
                        Day <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d9bf0] to-[#8b5cf6]">Pulse</span>
                    </h1>
                    <p className="text-[#8b98a5] text-sm max-w-xl">
                        Visualize your 24 hours. Optimize your energy allocation between fixed commitments, high-value work, and necessary rest.
                    </p>
                </div>
                <div className="flex gap-4">
                    {/* Quick Stats in Header */}
                    <div className="text-right">
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Productivity Score</div>
                        <div className="text-2xl font-black text-white font-['Outfit']">
                            {Math.round((stats.productive / (1440 - stats.fixed - stats.rest)) * 100) || 0}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">

                {/* Left: Editor Panel */}
                <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Edit3 size={16} className="text-[#1d9bf0]" /> Routine Editor
                    </h3>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        {/* Input Form */}
                        <div className="bg-[#16181c] p-5 rounded-2xl border border-white/5 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Activity</label>
                                <input
                                    className="w-full bg-black border border-[#2f3336] rounded-lg px-3 py-2 text-white text-sm focus:border-[#1d9bf0] outline-none transition-colors"
                                    placeholder="e.g. Deep Work"
                                    value={newItem.activity}
                                    onChange={e => setNewItem({ ...newItem, activity: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Start</label>
                                    <input type="time" className="w-full bg-black border border-[#2f3336] rounded-lg px-2 py-2 text-white text-xs focus:border-[#1d9bf0] outline-none"
                                        value={newItem.startTime} onChange={e => setNewItem({ ...newItem, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">End</label>
                                    <input type="time" className="w-full bg-black border border-[#2f3336] rounded-lg px-2 py-2 text-white text-xs focus:border-[#1d9bf0] outline-none"
                                        value={newItem.endTime} onChange={e => setNewItem({ ...newItem, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewItem({ ...newItem, category: cat.id })}
                                            className={`flex items-center gap-2 px-2 py-2 rounded-lg border text-[10px] transition-all
                         ${newItem.category === cat.id
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-black text-gray-400 border-[#2f3336] hover:border-white/20'}`}
                                        >
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleAdd}
                                className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Add Block
                            </button>
                        </div>

                        {/* List */}
                        <div className="space-y-2">
                            {routine.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((item, idx) => (
                                <div key={idx} className="group flex items-center bg-[#16181c]/50 hover:bg-[#16181c] border border-white/5 rounded-xl p-3 transition-colors">
                                    <div className="w-1 h-8 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold text-sm">{item.activity}</span>
                                            <span className="text-[9px] text-gray-500 uppercase border border-gray-700 px-1 rounded">{item.category}</span>
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-mono">{item.startTime} - {item.endTime}</div>
                                    </div>
                                    <button onClick={() => handleDelete(idx)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Routine'}
                            {!loading && <Check size={16} />}
                        </button>
                    </div>
                </div>

                {/* Center: Visualization */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Main Visualizer Card */}
                    <div className="flex-1 bg-[#09090b]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex items-center justify-center relative overflow-hidden group">
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#1d9bf0]/5 via-purple-500/5 to-transparent opacity-50" />

                        <div className="relative w-[400px] h-[400px] rounded-full shadow-2xl transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            style={{ background: getConicGradient() }}>

                            {/* Inner Circle (Hollow) */}
                            <div className="absolute inset-4 bg-[#09090b] rounded-full flex flex-col items-center justify-center z-10">
                                <div className="text-[#71767b] text-xs font-bold uppercase tracking-[0.2em] mb-2">Total Free Time</div>
                                <div className="text-6xl font-black text-white font-['Outfit'] tracking-tight">
                                    {Math.floor(stats.free / 60)}<span className="text-2xl text-gray-500 font-bold ml-1">h</span>
                                    {stats.free % 60 > 0 && <span className="text-4xl ml-2">{stats.free % 60}<span className="text-xl text-gray-500 ml-1">m</span></span>}
                                </div>
                                <div className="text-[#1d9bf0] text-xs font-medium mt-4 bg-[#1d9bf0]/10 px-3 py-1 rounded-full border border-[#1d9bf0]/20">
                                    {stats.free < 120 ? "Tight Schedule" : stats.free < 300 ? "Balanced Day" : "High Availability"}
                                </div>
                            </div>

                            {/* Clock Markers (Optional decoration) */}
                            {[0, 6, 12, 18].map(h => (
                                <div key={h} className="absolute text-[10px] font-bold text-gray-600"
                                    style={{
                                        top: '50%', left: '50%',
                                        transform: `translate(-50%, -50%) rotate(${h * 15}deg) translateY(-210px) rotate(-${h * 15}deg)`
                                    }}>
                                    {h}:00
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Fixed', val: stats.fixed, color: 'text-gray-400', icon: <Briefcase /> },
                            { label: 'Productive', val: stats.productive, color: 'text-[#1d9bf0]', icon: <Zap /> },
                            { label: 'Rest', val: stats.rest, color: 'text-purple-400', icon: <Moon /> },
                            { label: 'Leisure', val: stats.leisure, color: 'text-pink-400', icon: <Coffee /> },
                        ].map(stat => (
                            <div key={stat.label} className="bg-[#16181c]/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-[#16181c] transition-colors">
                                <div className={`${stat.color} mb-2 opacity-80`}>
                                    {
                                        stat.label === 'Fixed' ? <Briefcase size={20} /> :
                                            stat.label === 'Productive' ? <Zap size={20} /> :
                                                stat.label === 'Rest' ? <Moon size={20} /> :
                                                    <Coffee size={20} />
                                    }
                                </div>
                                <div className="text-2xl font-bold text-white font-['Outfit']">
                                    {Math.round(stat.val / 60)}<span className="text-xs text-gray-500 ml-0.5">h</span>
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </div>
    );
}

// Importing icons here just for the snippet context, ensure they are imported at the top
import { Edit3 } from "lucide-react";
