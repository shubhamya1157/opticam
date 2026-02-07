import { useState, useEffect, useMemo, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
    PieChart, Clock, Zap, Moon, Coffee, Briefcase, Plus, Trash2, Check,
    TrendingUp, AlertCircle, Play, Activity, Sun, Battery, Brain,
    ArrowRight, Sparkles, Timer, RotateCcw, Calendar, MoreHorizontal, X
} from "lucide-react";

export default function DayPulse() {
    const { user, handleUpdateUser } = useOutletContext();
    const [routine, setRoutine] = useState(user.dailyRoutine || []);
    const [newItem, setNewItem] = useState({ activity: "", startTime: "", endTime: "", color: "#3b82f6", category: "productive" });
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);

    const categories = [
        { id: 'fixed', label: 'Commitments', icon: <Briefcase size={14} />, desc: "Classes, Work", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", gradient: "from-rose-500 to-red-600" },
        { id: 'productive', label: 'Deep Work', icon: <Brain size={14} />, desc: "Study, Skills", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-500 to-indigo-600" },
        { id: 'rest', label: 'Recharge', icon: <Moon size={14} />, desc: "Sleep, Naps", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", gradient: "from-violet-500 to-purple-600" },
        { id: 'leisure', label: 'Leisure', icon: <Coffee size={14} />, desc: "Fun, Social", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500 to-teal-600" },
    ];

    // Update real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Every second for smooth UI
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

    const getStatus = () => {
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

        // Find current activity
        const current = routine.find(item => {
            const [sH, sM] = item.startTime.split(':').map(Number);
            const [eH, eM] = item.endTime.split(':').map(Number);
            const start = sH * 60 + sM;
            const end = eH * 60 + eM;
            if (end < start) return nowMinutes >= start || nowMinutes < end;
            return nowMinutes >= start && nowMinutes < end;
        });

        // Find next activity
        // Sort routine by start time
        const sortedRoutine = [...routine].sort((a, b) => {
            const [aH, aM] = a.startTime.split(':').map(Number);
            const [bH, bM] = b.startTime.split(':').map(Number);
            return (aH * 60 + aM) - (bH * 60 + bM);
        });

        // Find the first activity that starts after nowMinutes
        // We also need to consider activities that start tomorrow (which are effectively "next" if nothing is left today)
        // For simplicity, just find the next start time > nowMinutes. If none, pick the first one of the day (tomorrow).
        let next = sortedRoutine.find(item => {
            const [sH, sM] = item.startTime.split(':').map(Number);
            const start = sH * 60 + sM;
            return start > nowMinutes;
        });

        if (!next && sortedRoutine.length > 0) {
            next = sortedRoutine[0]; // Loop to start of day
        }

        return { current, next };
    };

    const { current, next } = getStatus();

    const handleAdd = () => {
        if (!newItem.activity || !newItem.startTime || !newItem.endTime) return;
        setRoutine([...routine, newItem]);
        setNewItem({ ...newItem, activity: "" });
        setShowAddModal(false);
    };

    const handleDelete = (index) => {
        if (window.confirm("Remove this block?")) {
            setRoutine(routine.filter((_, i) => i !== index));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            handleUpdateUser({ ...user, dailyRoutine: routine });
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
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans relative overflow-hidden">
            {/* Deep Space Background */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#0f0f15_0%,_#000000_100%)]" />
            <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" />

            {/* Ambient Glows */}
            <div className="fixed top-20 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="fixed bottom-20 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity size={18} className="text-blue-500 animate-pulse" />
                            <span className="text-[10px] font-mono tracking-[0.2em] text-blue-500/70 uppercase">
                                Temporal Synchronization
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-none">
                            DAY PULSE
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">.</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">System Time</div>
                                <div className="text-xl font-bold font-mono tracking-widest text-white">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <Clock className="text-blue-400" size={20} />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all uppercase flex items-center gap-2"
                        >
                            {loading ? <RotateCcw className="animate-spin" size={16} /> : <Check size={16} />}
                            {loading ? "Syncing..." : "Save Protocol"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: STATUS & CONTROLS (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* MAIN STATUS CARD */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-1 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="bg-[#0a0a0a] rounded-[22px] p-6 relative z-10 h-full flex flex-col justify-between min-h-[220px]">
                                {current ? (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Active Protocol
                                                </span>
                                                <Activity className="text-emerald-500/50" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white leading-tight mb-2">
                                                {current.activity}
                                            </h2>
                                            <p className="text-gray-400 font-mono text-sm flex items-center gap-2">
                                                <Timer size={14} className="text-emerald-500" />
                                                T-Minus: {(() => {
                                                    const [eH, eM] = current.endTime.split(':').map(Number);
                                                    const endMin = eH * 60 + eM;
                                                    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
                                                    let diff = endMin - nowMin;
                                                    if (diff < 0) diff += 1440;
                                                    const h = Math.floor(diff / 60);
                                                    const m = diff % 60;
                                                    return `${h}h ${m}m remaining`;
                                                })()}
                                            </p>
                                        </div>
                                        <div className="mt-8">
                                            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-1/3 animate-pulse rounded-full" />
                                                {/* Requires real math for progress bar, simplified for visual */}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    System Standby
                                                </span>
                                                <Zap className="text-blue-500/50" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white leading-tight mb-2">
                                                Ready for Next Uplink
                                            </h2>
                                            <p className="text-gray-400 font-mono text-sm max-w-[250px]">
                                                Systems nominal. Awaiting scheduled protocol execution.
                                            </p>
                                        </div>

                                        {next ? (
                                            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">UP NEXT</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-white max-w-[150px] truncate">{next.activity}</span>
                                                    <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{next.startTime}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">NO DATA</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* STATS GRID */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Deep Work", val: stats.productive, icon: Brain, color: "text-blue-400", border: "hover:border-blue-500/50" },
                                { label: "Recharge", val: stats.rest, icon: Moon, color: "text-violet-400", border: "hover:border-violet-500/50" },
                                { label: "Leisure", val: stats.leisure, icon: Coffee, color: "text-emerald-400", border: "hover:border-emerald-500/50" },
                                { label: "Fixed", val: stats.fixed, icon: Briefcase, color: "text-rose-400", border: "hover:border-rose-500/50" },
                            ].map((stat, i) => (
                                <div key={i} className={`bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl transition-all duration-300 ${stat.border} group`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <stat.icon size={18} className={`${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {Math.floor(stat.val / 60)}<span className="text-sm text-gray-500">h</span> {stat.val % 60}<span className="text-sm text-gray-500">m</span>
                                    </div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-600 group-hover:text-gray-400 transition-colors">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ADD BUTTON */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full py-4 rounded-2xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 group"
                        >
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            Initialize New Block
                        </button>

                        {/* ROUTINE LIST */}
                        <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-3xl p-6 h-[400px] overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 sticky top-0 bg-[#0a0a0a] py-2 z-10 flex items-center gap-2">
                                <Activity size={12} /> Sequence Log
                            </h3>
                            <div className="space-y-3">
                                {routine.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((item, idx) => (
                                    <div key={idx} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 relative">
                                        <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${item.category === 'productive' ? 'from-blue-500 to-indigo-600' :
                                            item.category === 'rest' ? 'from-violet-500 to-purple-600' :
                                                item.category === 'leisure' ? 'from-emerald-500 to-teal-600' :
                                                    'from-rose-500 to-red-600'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">{item.activity}</div>
                                            <div className="text-[10px] font-mono text-gray-500">{item.startTime} - {item.endTime}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(idx)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {routine.length === 0 && (
                                    <div className="text-center py-10 text-gray-600 text-xs font-mono">
                                        NO PROTOCOLS INITIALIZED
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: VISUALIZER (8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="h-full bg-[#0a0a0a] border border-white/10 rounded-[40px] p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[600px] group">

                            {/* CRT Grid Effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

                            {/* Central Clock */}
                            <div className="relative w-full max-w-[500px] aspect-square">
                                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                                    {/* Tracks */}
                                    <circle cx="50" cy="50" r="48" fill="none" stroke="#ffffff" strokeWidth="0.2" className="opacity-10" />
                                    <circle cx="50" cy="50" r="42" fill="#050505" stroke="#ffffff" strokeWidth="0.2" className="opacity-20" />

                                    {/* Hour Ticks */}
                                    {[...Array(24)].map((_, i) => {
                                        const angle = (i / 24) * 360;
                                        const p1 = polarToCartesian(50, 50, 44, angle);
                                        const p2 = polarToCartesian(50, 50, 48, angle);
                                        return (
                                            <g key={i}>
                                                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                                                {i % 3 === 0 && (
                                                    <text x={polarToCartesian(50, 50, 38, angle).x} y={polarToCartesian(50, 50, 38, angle).y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.4)" fontSize="2.5" fontWeight="bold" fontFamily="monospace">
                                                        {i}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}

                                    {/* Routine Arcs */}
                                    {routine.map((item, idx) => {
                                        const [sH, sM] = item.startTime.split(':').map(Number);
                                        const [eH, eM] = item.endTime.split(':').map(Number);
                                        const startMin = sH * 60 + sM;
                                        const endMin = eH * 60 + eM;
                                        const startAng = (startMin / 1440) * 360;
                                        let endAng = (endMin / 1440) * 360;
                                        if (endAng < startAng) endAng += 360;

                                        const color = item.category === 'productive' ? '#3b82f6' :
                                            item.category === 'rest' ? '#8b5cf6' :
                                                item.category === 'leisure' ? '#10b981' : '#f43f5e';

                                        return (
                                            <path
                                                key={idx}
                                                d={describeArc(50, 50, 42, startAng, endAng)}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="6"
                                                className="opacity-80 hover:opacity-100 transition-all cursor-pointer hover:stroke-[8]"
                                            >
                                                <title>{item.activity} ({item.startTime} - {item.endTime})</title>
                                            </path>
                                        );
                                    })}

                                    {/* Current Time Indicator */}
                                    {(() => {
                                        const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
                                        const angle = (nowMin / 1440) * 360;
                                        const p = polarToCartesian(50, 50, 49, angle);
                                        return (
                                            <circle cx={p.x} cy={p.y} r="1.5" fill="#fff" className="animate-pulse shadow-[0_0_10px_white]" />
                                        )
                                    })()}
                                </svg>

                                {/* Center Data */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-mono mb-1">Efficiency</div>
                                    <div className="text-5xl font-black text-white tracking-tighter shadow-blue-500/50 drop-shadow-lg">
                                        {stats.score}<span className="text-xl text-gray-600">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-8 flex flex-wrap gap-4 absolute bottom-8">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 backdrop-blur-sm">
                                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.gradient}`} />
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{cat.label}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* CREATE MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
                    <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-scale-in">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">New Protocol</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Objective</label>
                                <input
                                    value={newItem.activity}
                                    onChange={e => setNewItem({ ...newItem, activity: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all"
                                    placeholder="e.g. Quantum Physics Study"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Start</label>
                                    <input type="time"
                                        value={newItem.startTime}
                                        onChange={e => setNewItem({ ...newItem, startTime: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">End</label>
                                    <input type="time"
                                        value={newItem.endTime}
                                        onChange={e => setNewItem({ ...newItem, endTime: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewItem({ ...newItem, category: cat.id })}
                                            className={`p-3 rounded-xl border flex items-center gap-2 transition-all ${newItem.category === cat.id
                                                ? `bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                                                : 'bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`p-1 rounded bg-gradient-to-br ${cat.gradient} text-white`}>
                                                {cat.icon}
                                            </div>
                                            <span className="text-xs font-bold uppercase">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-bold text-xs uppercase hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                className="flex-1 py-3 rounded-xl bg-white text-black font-black text-xs uppercase hover:scale-105 transition-all shadow-lg"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
