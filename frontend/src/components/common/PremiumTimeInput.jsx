import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function PremiumTimeInput({ value, onChange }) {
    // Parse initial value (HH:mm) to 12h format
    const parseTime = (timeStr) => {
        if (!timeStr) return { hour: "12", minute: "00", period: "AM" };
        const [h, m] = timeStr.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const hour = h % 12 || 12; // Convert 0 to 12
        return {
            hour: hour.toString().padStart(2, "0"),
            minute: m.toString().padStart(2, "0"),
            period
        };
    };

    const [timeState, setTimeState] = useState(parseTime(value));

    useEffect(() => {
        setTimeState(parseTime(value));
    }, [value]);

    const handleChange = (field, val) => {
        const newState = { ...timeState, [field]: val };
        setTimeState(newState);

        // Convert back to 24h for parent
        let h = parseInt(newState.hour);
        if (newState.period === "PM" && h !== 12) h += 12;
        if (newState.period === "AM" && h === 12) h = 0;

        onChange(`${h.toString().padStart(2, "0")}:${newState.minute}`);
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

    return (
        <div className="flex items-center gap-1 bg-[#16181c] border border-[#2f3336] rounded-lg px-2 py-2 focus-within:border-[#1d9bf0] transition-colors w-full group relative">
            <div className="relative flex-1">
                <select
                    value={timeState.hour}
                    onChange={(e) => handleChange("hour", e.target.value)}
                    className="w-full bg-transparent text-white text-center text-sm font-bold appearance-none outline-none cursor-pointer z-10 relative"
                >
                    {hours.map((h) => (
                        <option key={h} value={h} className="bg-[#000000] text-gray-300">{h}</option>
                    ))}
                </select>
            </div>

            <span className="text-[#71767b] font-bold text-xs">:</span>

            <div className="relative flex-1">
                <select
                    value={timeState.minute}
                    onChange={(e) => handleChange("minute", e.target.value)}
                    className="w-full bg-transparent text-white text-center text-sm font-bold appearance-none outline-none cursor-pointer z-10 relative"
                >
                    {minutes.map((m) => (
                        <option key={m} value={m} className="bg-[#000000] text-gray-300">{m}</option>
                    ))}
                </select>
            </div>

            <div className="w-px h-4 bg-[#2f3336] mx-1"></div>

            <div className="relative flex-1">
                <select
                    value={timeState.period}
                    onChange={(e) => handleChange("period", e.target.value)}
                    className="w-full bg-transparent text-[#1d9bf0] text-center text-xs font-bold appearance-none outline-none cursor-pointer z-10 relative"
                >
                    <option value="AM" className="bg-[#000000]">AM</option>
                    <option value="PM" className="bg-[#000000]">PM</option>
                </select>
            </div>

            {/* Visual overlay for hover effects if needed */}
            <div className="absolute inset-0 pointer-events-none rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
}
