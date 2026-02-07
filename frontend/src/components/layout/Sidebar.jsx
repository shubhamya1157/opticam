import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileModal from "../features/profile/ProfileModal";
import {
  Home,
  CheckSquare,
  Trophy,
  Calendar,
  BookOpen,
  LogOut,
  Bell,
  Sparkles,
  Users,
  ChevronRight,
  MoreHorizontal,
  Activity,
  Wifi
} from "lucide-react";
import logo from "../../assets/opticam-logo.png";
import RoutineWidget from "../features/dashboard/RoutineWidget";

export default function Sidebar({ user, onUpdateUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const menuItems = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <CheckSquare size={20} />, label: "Tasks", path: "/tasks" },
    { icon: <Calendar size={20} />, label: "Calendar", path: "/calendar" },
    { icon: <Users size={20} />, label: "Community", path: "/community" },
    { icon: <Wifi size={20} />, label: "Resonance", path: "/resonance" },
  ];

  const secondaryItems = [
    { icon: <Activity size={20} />, label: "Day Pulse", path: "/day-pulse" },
    { icon: <Trophy size={20} />, label: "Achievements", path: "/achievements" },
    { icon: <BookOpen size={20} />, label: "Notes", path: "/notes" },
    { icon: <Bell size={20} />, label: "Notifications", path: "/notifications" },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <div
        onClick={() => navigate(item.path, { state: { user } })}
        className={`group flex items-center justify-between px-4 py-3.5 mx-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent ${isActive
          ? "bg-[#1d9bf0]/10 border-[#1d9bf0]/20 text-white shadow-lg shadow-blue-500/5"
          : "hover:bg-white/5 text-[#8b98a5] hover:text-white hover:border-white/5"
          }`}
      >
        <div className="flex items-center gap-3.5">
          <span className={`transition-transform duration-300 ${isActive ? "scale-110 text-[#1d9bf0]" : "group-hover:scale-110 group-hover:text-gray-200"}`}>
            {item.icon}
          </span>
          <span className={`text-[15px] font-medium tracking-wide ${isActive ? "font-semibold" : ""}`}>
            {item.label}
          </span>
        </div>
        {isActive && (
          <ChevronRight size={16} className="text-[#1d9bf0] opacity-100 transition-opacity" />
        )}
      </div>
    );
  };

  return (
    <>
      <aside className="w-[280px] h-[calc(100vh-1rem)] mt-1 mb-2 ml-2 flex flex-col sticky top-1 bg-[#09090b]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden z-30 font-sans shadow-2xl transition-all duration-300 ring-1 ring-white/5">

        {/* Subtle Inner Gradient for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* Brand Section */}
        <div className="p-6 pb-2 bg-transparent sticky top-0 z-50">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>

            {/* Refined Logo Container */}
            <div className="w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center backdrop-blur-md shadow-sm group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
              <img src={logo} alt="OptiCam Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white tracking-tight font-sans group-hover:text-white transition-colors">
                Opti<span className="text-[#1d9bf0]">Cam</span>
              </h1>
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-200 font-medium tracking-wide">Optimisation In Campus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto space-y-8 custom-scrollbar relative z-10">

          {/* Main Menu */}
          <div>
            <p className="px-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">Overview</p>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>

          {/* Productivity */}
          <div>
            <p className="px-5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-3">Manage</p>
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>

        </nav>

        {/* Smart Time Table Widget */}
        <RoutineWidget user={user} onUpdateUser={onUpdateUser} />

        {/* User Profile Section (Bottom Fixed) */}
        <div className="p-3 mt-auto relative z-10">
          <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-2xl p-3">
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 cursor-pointer group mb-3"
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full ring-2 ring-white/10 overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user.name}&backgroundColor=000000`}
                    alt="Profile"
                    className="w-full h-full bg-black object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#09090b] rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#1d9bf0] transition-colors">
                  {user.name}
                </h4>
                <p className="text-[11px] text-gray-400 truncate capitalize">
                  {user.role}
                </p>
              </div>

              <div className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal size={16} />
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition-all border border-red-500/10"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

      </aside>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onUpdateUser={onUpdateUser}
      />
    </>
  );
}
