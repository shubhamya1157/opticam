import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
    Trophy, Timer, Zap, Target, TrendingUp, CheckCircle2,
    Award, BarChart3, CalendarDays
} from "lucide-react";
import { fetchTasks } from "../services/taskService";

export default function Achievements() {
    const { user } = useOutletContext();
    const [completedTasks, setCompletedTasks] = useState([]);

    // Stats (Safeguard against undefined stats on old users)
    const stats = user.stats || { tasksCompleted: 0, focusMinutes: 0, currentStreak: 0 };

    useEffect(() => {
        if (user?._id) {
            fetchTasks(user._id).then(res => {
                // Get last 10 completed tasks
                const done = res.data
                    .filter(t => t.completed)
                    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                setCompletedTasks(done);
            });
        }
    }, [user]);

    // Format Focus Time (Minutes to Hours/Mins)
    const formatTime = (mins) => {
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        const m = mins % 60;
        return `${hrs}h ${m}m`;
    };

    // Milestones Logic
    const milestones = [
        { label: "Getting Started", target: 1, current: stats.tasksCompleted, icon: <CheckCircle2 size={18} /> },
        { label: "Productivity Pro", target: 50, current: stats.tasksCompleted, icon: <Target size={18} /> },
        { label: "Deep Worker", target: 500, current: stats.focusMinutes, suffix: "m", icon: <Timer size={18} /> },
        { label: "Consistency King", target: 7, current: stats.currentStreak, suffix: " Days", icon: <CalendarDays size={18} /> },
    ];

    return (
        <div className="max-w-6xl mx-auto font-sans animate-fade-in pb-10">

            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <BarChart3 className="text-[#1d9bf0]" size={36} /> Performance
                    </h1>
                    <p className="text-gray-400">Track your productivity metrics and consistancy.</p>
                </div>

                <div className="flex items-center gap-2 bg-[#0f1419] px-4 py-2 rounded-xl border border-white/5">
                    <span className="text-gray-500 text-sm font-medium">Productivity Level</span>
                    <span className="text-white font-bold text-lg">{user.level}</span>
                </div>
            </header>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard
                    title="Tasks Completed"
                    value={stats.tasksCompleted}
                    icon={<CheckCircle2 className="text-green-500" />}
                    trend="+12% this week"
                />
                <StatCard
                    title="Focus Time"
                    value={formatTime(stats.focusMinutes)}
                    icon={<Timer className="text-blue-500" />}
                    trend="Quality hours"
                />
                <StatCard
                    title="Current Streak"
                    value={`${stats.currentStreak} Days`}
                    icon={<Zap className="text-yellow-500" />}
                    trend="Keep it going!"
                />
                <StatCard
                    title="XP Gained"
                    value={user.xp}
                    icon={<Trophy className="text-purple-500" />}
                    trend={`Next Lvl: ${user.level * 1000}`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Milestones */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                            <Award size={20} className="text-[#1d9bf0]" /> Milestones
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {milestones.map((m, idx) => (
                                <MilestoneCard key={idx} milestone={m} />
                            ))}
                        </div>
                    </section>

                    {/* Recent Tasks */}
                    <section>
                        <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                            <TrendingUp size={20} className="text-[#1d9bf0]" /> Completion Log
                        </h2>
                        <div className="bg-[#0f1419] rounded-2xl border border-white/5 overflow-hidden">
                            {completedTasks.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No completed tasks yet.</div>
                            ) : (
                                completedTasks.slice(0, 5).map((task, i) => (
                                    <div key={task._id} className="p-4 border-b border-white/5 last:border-0 flex items-center hover:bg-white/5 transition">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0 mr-4">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium truncate">{task.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                {new Date(task.completedAt).toLocaleDateString()} • {task.duration ? `${task.duration}m focus` : 'Quick task'}
                                            </p>
                                        </div>
                                        <span className="text-xs font-mono text-gray-600 bg-white/5 px-2 py-1 rounded">+{50 + (task.duration || 0)} XP</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Col: Quote / Insight */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#1d9bf0]/20 to-purple-500/10 p-6 rounded-2xl border border-[#1d9bf0]/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-[#1d9bf0] font-bold text-lg mb-2">Productivity Insight</h3>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                "Success is the sum of small efforts, repeated day in and day out."
                            </p>
                            <div className="h-1 w-20 bg-[#1d9bf0]/50 rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-[#0f1419] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-white font-bold mb-4">Level Progress</h3>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Lvl {user.level}</span>
                            <span className="text-gray-400">Lvl {user.level + 1}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-[#1d9bf0]"
                                style={{ width: `${(user.xp % 1000) / 1000 * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-2">
                            {1000 - (user.xp % 1000)} XP needed for next level
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }) {
    return (
        <div className="bg-[#0f1419] p-6 rounded-2xl border border-white/5 hover:border-[#1d9bf0]/30 transition group">
            <div className="flex justify-between items-start mb-4">
                <div className="text-gray-400">{title}</div>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition">{icon}</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 font-mono">{trend}</div>
        </div>
    )
}

function MilestoneCard({ milestone }) {
    const progress = Math.min(100, (milestone.current / milestone.target) * 100);
    const isUnlocked = milestone.current >= milestone.target;

    return (
        <div className={`p-5 rounded-2xl border transition ${isUnlocked ? 'bg-[#1d9bf0]/10 border-[#1d9bf0]/30' : 'bg-[#0f1419] border-white/5'}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${isUnlocked ? 'bg-[#1d9bf0] text-white' : 'bg-white/5 text-gray-500'}`}>
                    {milestone.icon}
                </div>
                <div>
                    <h4 className={`font-bold ${isUnlocked ? 'text-[#1d9bf0]' : 'text-gray-300'}`}>{milestone.label}</h4>
                    <p className="text-xs text-gray-500">Target: {milestone.target}{milestone.suffix || ""}</p>
                </div>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${isUnlocked ? 'bg-[#1d9bf0]' : 'bg-gray-600'}`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <div className="flex justify-end mt-2">
                <span className="text-[10px] text-gray-400 font-mono">
                    {milestone.current} / {milestone.target}
                </span>
            </div>
        </div>
    )
}
