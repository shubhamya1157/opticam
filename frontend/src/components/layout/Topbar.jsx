import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Cloud, PanelLeft, Sparkles } from 'lucide-react';

export default function Topbar({ user, toggleSidebar, isSidebarOpen }) {
  const [date, setDate] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = date.getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sun className="text-yellow-400" size={24} /> };
    if (hour < 18) return { text: "Good Afternoon", icon: <Cloud className="text-blue-400" size={24} /> };
    return { text: "Good Evening", icon: <Moon className="text-purple-400" size={24} /> };
  };

  const { text, icon } = getGreeting();

  return (
    <div className="flex justify-between items-center mb-4 p-4 bg-[#050507]/90 backdrop-blur-xl border border-white/10 rounded-3xl ring-1 ring-white/5 shadow-2xl relative z-10 animate-fade-in mt-1 mr-2">
      <div className="flex items-center gap-6">



        {location.pathname === '/dashboard' && (
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              {icon}
              <span className="text-xs font-semibold tracking-widest text-[#71767b] uppercase font-['Outfit']">
                {text}
              </span>
            </div>
            <h1 className="text-3xl font-[700] text-white tracking-tight font-['Outfit'] leading-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1d9bf0] to-[#8b5cf6]">{user.name.split(' ')[0]}</span>
            </h1>

            {/* Sub-greeting - Minimalist & Elegant */}
            <div className="flex items-center gap-3 mt-2 animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="h-[2px] w-8 bg-gradient-to-r from-[#1d9bf0] to-transparent rounded-full"></div>
              <p className="text-sm text-[#8b98a5] font-['Outfit'] tracking-wide">
                Let's make today <span className="text-white font-bold tracking-wider">PRODUCTIVE</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {location.pathname === '/dashboard' && (
        <div className="hidden md:block text-right">
          <div className="flex flex-col items-end">
            <h2 className="text-4xl font-black tabular-nums text-white tracking-tighter leading-none">
              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </h2>
            <p className="text-[#1d9bf0] font-bold text-[10px] tracking-[0.2em] uppercase mt-1">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
