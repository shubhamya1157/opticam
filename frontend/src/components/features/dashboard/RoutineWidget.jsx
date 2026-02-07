
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

export default function RoutineWidget({ user }) {
    const navigate = useNavigate();
    const [currentActivity, setCurrentActivity] = useState(null);
    const [donutGradient, setDonutGradient] = useState("");

    useEffect(() => {
        updateDayPulse();
        const interval = setInterval(updateDayPulse, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [user.dailyRoutine]);

    const updateDayPulse = () => {
        if (!user.dailyRoutine || user.dailyRoutine.length === 0) {
            setDonutGradient("");
            setCurrentActivity(null);
            return;
        }

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // 1. Calculate Conic Gradient
        const sorted = [...user.dailyRoutine].sort((a, b) => {
            const [aH, aM] = a.startTime.split(':').map(Number);
            const [bH, bM] = b.startTime.split(':').map(Number);
            return (aH * 60 + aM) - (bH * 60 + bM);
        });

        let gradientParts = [];
        sorted.forEach(item => {
            const [startH, startM] = item.startTime.split(':').map(Number);
            const [endH, endM] = item.endTime.split(':').map(Number);

            let startDeg = ((startH * 60 + startM) / 1440) * 360;
            let endDeg = ((endH * 60 + endM) / 1440) * 360;

            if (endDeg < startDeg) endDeg += 360; // Handle overnight

            gradientParts.push(`${item.color} ${startDeg}deg ${endDeg}deg`);
        });

        // Use theme-aware color for the empty space (using CSS variable via a small trick or just a neutral color that works in both)
        // Since gradients need explicit colors, we'll check valid hex. But we can use 'transparent' and let background show?
        // Better: Use a computed style or just a safe dark-gray for now, as donut charts are tricky with CSS vars in JS strings
        // Actually, we can use a hardcoded neutral that works for both or simply reuse the track color.
        setDonutGradient(`conic-gradient(from 0deg, ${gradientParts.join(', ')}, transparent 0deg)`);


        // 2. Find Current Activity
        let active = null;
        for (let item of user.dailyRoutine) {
            const [sH, sM] = item.startTime.split(':').map(Number);
            const [eH, eM] = item.endTime.split(':').map(Number);
            const startTotal = sH * 60 + sM;
            let endTotal = eH * 60 + eM;
            if (endTotal < startTotal) endTotal += 1440; // Overnight

            let effectiveCurrent = currentMinutes;
            if (startTotal > endTotal && currentMinutes < endTotal) effectiveCurrent += 1440;

            if (effectiveCurrent >= startTotal && effectiveCurrent < endTotal) {
                active = item;
            }
        }
        setCurrentActivity(active);
    };

    return (
        <div
            onClick={() => navigate('/day-pulse')}
            className="mx-4 mb-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all group relative overflow-hidden shadow-sm"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-[10px] font-bold text-[var(--test-secondary)] uppercase tracking-widest mb-1">Day Pulse</h4>
                    {currentActivity ? (
                        <div>
                            <div className="text-xl font-bold text-[var(--text-primary)] font-['Outfit'] leading-tight">{currentActivity.activity}</div>
                            <div className="text-[10px] text-[var(--accent-blue)] font-medium mt-0.5 animate-pulse">Running Now</div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-xl font-bold text-[var(--text-primary)] font-['Outfit'] leading-tight">Free Time</div>
                            <div className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">Unscheduled</div>
                        </div>
                    )}
                </div>

                {/* Donut Chart Visual */}
                <div className="relative w-12 h-12 rounded-full border-4 border-[var(--bg-tertiary)]" style={{ background: donutGradient || 'var(--bg-tertiary)' }}>
                    <div className="absolute inset-0 m-auto w-8 h-8 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                        <Clock size={14} className="text-[var(--text-secondary)]" />
                    </div>
                </div>
            </div>

            {/* Timeline Bar */}
            <div className="mt-4 h-1.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden flex">
                {user.dailyRoutine?.map((item, i) => {
                    const [sH, sM] = item.startTime.split(':').map(Number);
                    const [eH, eM] = item.endTime.split(':').map(Number);
                    let duration = (eH * 60 + eM) - (sH * 60 + sM);
                    if (duration < 0) duration += 1440;
                    const widthPercent = (duration / 1440) * 100;
                    return <div key={i} style={{ width: `${widthPercent}%`, backgroundColor: item.color }} className="h-full" />
                })}
            </div>
        </div>
    );
}
