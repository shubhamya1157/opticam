import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { PieChart, Clock, Zap, Moon, Coffee, Briefcase, Plus, Trash2, Check, TrendingUp, AlertCircle, Play, Activity, Sun, Battery, Brain } from "lucide-react";

export default function DayPulse() {
    const { user, onUpdateUser } = useOutletContext();
    const [routine, setRoutine] = useState(user.dailyRoutine || []);
    const [newItem, setNewItem] = useState({ activity: "", startTime: "", endTime: "", color: "#3b82f6", category: "productive" });
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const categories = [
        { id: 'fixed', label: 'Commitments', icon: <Briefcase size={14} />, desc: "Classes, Work", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
        { id: 'productive', label: 'Deep Work', icon: <Brain size={14} />, desc: "Study, Skills", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        { id: 'rest', label: 'Recharge', icon: <Moon size={14} />, desc: "Sleep, Naps", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
        { id: 'leisure', label: 'Leisure', icon: <Coffee size={14} />, desc: "Fun, Social", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    ];

    // Update real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Every minute
        return () => clearInterval(timer);
    }, []);

    // Derived Stats
    const stats = useMemo(() => {
        let totals = { productive: 0, fixed: 0, rest: 0, leisure: 0, occupied: 0 };
        routine.forEach(item => {
            const [sH, sM] = item.startTime.split(':').map(Number);
            const [eH, eM] = item.endTime.split(':').map(Number);
            let duration = (eH * 60 + eM) - (sH * 60 + sM);
            if (duration < 0) duration += 1440; // Spans midnight
            if (totals[item.category] !== undefined) totals[item.category] += duration;
            totals.occupied += duration;
        });
        return {
            ...totals,
            free: 1440 - totals.occupied,
            score: Math.min(100, Math.round((totals.productive / 360) * 100)) // Arbitrary score based on 6h productivity goal
        };
    }, [routine]);

    const getCurrentActivity = () => {
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        return routine.find(item => {
            const [sH, sM] = item.startTime.split(':').map(Number);
            const [eH, eM] = item.endTime.split(':').map(Number);
            const start = sH * 60 + sM;
            const end = eH * 60 + eM;
            if (end < start) { // Spans midnight
                return nowMinutes >= start || nowMinutes < end;
            }
            return nowMinutes >= start && nowMinutes < end;
        });
    };

    const currentActivity = getCurrentActivity();

    const handleAdd = () => {
        if (!newItem.activity || !newItem.startTime || !newItem.endTime) return;
        setRoutine([...routine, newItem]);
        setNewItem({ ...newItem, activity: "" });
    };

    const handleDelete = (index) => {
        setRoutine(routine.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call or replace with actual endpoint
            // const res = await fetch("...", ...);
            // Mock update for now
            onUpdateUser({ ...user, dailyRoutine: routine });
            // Assuming API success
        } catch (err) {
            console.error("Failed to save", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper to calc svg arc
    const describeArc = (x, y, radius, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            "L", x, y,
            "L", start.x, start.y
        ].join(" ");
    };

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    return (
        <div className="min-h-screen space-y-6 p-6 animate-fade-in pb-24 font-['Outfit']">

            {/* 🟢 HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-[#09090b] p-6 rounded-[32px] border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                        Day <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Pulse</span>
                        <Activity className="text-blue-500 animate-pulse" size={28} />
                    </h1>
                    <p className="text-gray-400/90 text-base font-medium max-w-xl leading-relaxed tracking-wide opacity-80 italic">
                        "Your routine is the architect of your destiny. Operate with precision, harness your energy, and turn every hour into a masterpiece of focus."
                    </p>
                </div>

                {/* Live Time Badge */}
                <div className="flex items-center gap-4 bg-[#16181c] px-5 py-3 rounded-2xl border border-white/5 shadow-xl transition-transform hover:scale-105">
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Current Time</div>
                        <div className="text-2xl font-mono text-white font-bold tracking-wider">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* 🟢 LEFT COL: CURRENT STATUS & STATS (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Current Activity Card */}
                    <div className="bg-gradient-to-br from-[#09090b] to-[#16181c] rounded-[32px] p-6 border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={80} className="stroke-white" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Happening Now</span>
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                {currentActivity ? currentActivity.activity : "Free Time"}
                            </h2>
                            <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
                                <Clock size={14} className="text-blue-500" />
                                {currentActivity
                                    ? `${currentActivity.startTime} - ${currentActivity.endTime}`
                                    : "No scheduled activity right now."}
                            </p>

                            {/* Progress bar for current activity could go here */}
                            <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-1/3 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#09090b] p-4 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <Brain size={20} className="text-blue-400" />
                                <span className="text-[10px] font-bold text-gray-500">DEEP WORK</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{Math.floor(stats.productive / 60)}<span className="text-sm text-gray-500">h</span> {stats.productive % 60}m</div>
                        </div>
                        <div className="bg-[#09090b] p-4 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <Moon size={20} className="text-purple-400" />
                                <span className="text-[10px] font-bold text-gray-500">SLEEP</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{Math.floor(stats.rest / 60)}<span className="text-sm text-gray-500">h</span> {stats.rest % 60}m</div>
                        </div>
                        <div className="bg-[#09090b] p-4 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <Coffee size={20} className="text-emerald-400" />
                                <span className="text-[10px] font-bold text-gray-500">LEISURE</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{Math.floor(stats.leisure / 60)}<span className="text-sm text-gray-500">h</span> {stats.leisure % 60}m</div>
                        </div>
                        <div className="bg-[#09090b] p-4 rounded-2xl border border-white/5 hover:border-rose-500/20 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <Briefcase size={20} className="text-rose-400" />
                                <span className="text-[10px] font-bold text-gray-500">FIXED</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{Math.floor(stats.fixed / 60)}<span className="text-sm text-gray-500">h</span> {stats.fixed % 60}m</div>
                        </div>
                    </div>

                    {/* Editor Trigger (or direct form) */}
                    <div className="bg-[#09090b] rounded-3xl border border-white/5 p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Plus size={16} className="text-blue-500" /> Quick Add Block
                        </h3>

                        <input
                            className="w-full bg-[#16181c] border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500/50 outline-none transition-colors"
                            placeholder="Activity Name (e.g. Gym)"
                            value={newItem.activity}
                            onChange={e => setNewItem({ ...newItem, activity: e.target.value })}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <input type="time" className="bg-[#16181c] border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none"
                                value={newItem.startTime} onChange={e => setNewItem({ ...newItem, startTime: e.target.value })}
                            />
                            <input type="time" className="bg-[#16181c] border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none"
                                value={newItem.endTime} onChange={e => setNewItem({ ...newItem, endTime: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2 bg-[#16181c] p-1 rounded-xl overflow-x-auto">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setNewItem({ ...newItem, category: cat.id })}
                                    className={`p-2 rounded-lg transition-all ${newItem.category === cat.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                    title={cat.label}
                                >
                                    {cat.icon}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleAdd}
                            className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                        >
                            Add to Schedule
                        </button>

                        <button
                            onClick={handleSave}
                            className="w-full bg-[#16181c] text-gray-400 hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors border border-white/5"
                        >
                            {loading ? "Saving..." : "Save Routine"}
                        </button>
                    </div>

                    {/* Routine List */}
                    <div className="bg-[#09090b] rounded-3xl border border-white/5 p-6 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Activity size={16} className="text-gray-500" /> Your Schedule
                        </h3>
                        <div className="space-y-2">
                            {routine.length === 0 && <div className="text-gray-600 text-xs italic">No activities added yet.</div>}
                            {routine.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((item, idx) => (
                                <div key={idx} className="group flex items-center justify-between bg-[#16181c]/50 hover:bg-[#16181c] border border-white/5 rounded-xl p-3 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1 h-8 rounded-full ${item.category === 'fixed' ? 'bg-rose-500' : item.category === 'productive' ? 'bg-blue-500' : item.category === 'rest' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                                        <div>
                                            <div className="text-white font-bold text-sm leading-tight">{item.activity}</div>
                                            <div className="text-[10px] text-gray-500 font-mono">{item.startTime} - {item.endTime}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(idx)} className="text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* 🟢 CENTER/RIGHT: 24H VISUALIZER (8 cols) */}
                <div className="lg:col-span-8 bg-[#09090b] border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center relative min-h-[600px] overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none"></div>

                    {/* 24H CLOCK SVG */}
                    <div className="relative w-full max-w-[500px] aspect-square animate-scale-in">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                            {/* Outer Ring */}
                            <circle cx="50" cy="50" r="48" fill="none" stroke="#2f3336" strokeWidth="0.5" className="opacity-30" />
                            <circle cx="50" cy="50" r="40" fill="#16181c" stroke="#2f3336" strokeWidth="0.2" />

                            {/* Hour Markers */}
                            {[...Array(24)].map((_, i) => {
                                const angle = (i / 24) * 360;
                                const p1 = polarToCartesian(50, 50, 44, angle);
                                const p2 = polarToCartesian(50, 50, 47, angle);
                                return (
                                    <g key={i}>
                                        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#71767b" strokeWidth="0.5" />
                                        {i % 3 === 0 && (
                                            <text
                                                x={polarToCartesian(50, 50, 36, angle).x}
                                                y={polarToCartesian(50, 50, 36, angle).y}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                fill="#71767b"
                                                fontSize="3"
                                                fontWeight="bold"
                                            >
                                                {i}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Routine Sectors */}
                            {routine.map((item, idx) => {
                                const [sH, sM] = item.startTime.split(':').map(Number);
                                const [eH, eM] = item.endTime.split(':').map(Number);
                                const startMin = sH * 60 + sM;
                                const endMin = eH * 60 + eM;
                                const startAng = (startMin / 1440) * 360;
                                let endAng = (endMin / 1440) * 360;
                                if (endAng < startAng) endAng += 360; // Cross midnight

                                const colorMap = {
                                    fixed: '#ef4444',
                                    productive: '#3b82f6',
                                    rest: '#8b5cf6',
                                    leisure: '#10b981'
                                };

                                return (
                                    <path
                                        key={idx}
                                        d={describeArc(50, 50, 40, startAng, endAng)}
                                        fill="none"
                                        stroke={colorMap[item.category] || '#fff'}
                                        strokeWidth="8"
                                        className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                        strokeDasharray="2 0.5" // Optional texture
                                    >
                                        <title>{item.activity} ({item.startTime} - {item.endTime})</title>
                                    </path>
                                );
                            })}

                            {/* Inner Hub */}
                            <circle cx="50" cy="50" r="15" fill="#09090b" stroke="#2f3336" strokeWidth="0.5" />
                        </svg>

                        {/* Center Content Absolute */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Efficiency</div>
                            <div className="text-4xl font-black text-white">{stats.score}%</div>
                        </div>

                        {/* Current Time Hand (Optional, maybe too complex for SVG calc right now, keep simple) */}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 flex gap-6">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${cat.bg.replace('/10', '')}`}></span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
