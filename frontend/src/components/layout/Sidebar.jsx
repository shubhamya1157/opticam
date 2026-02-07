
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
  Wifi,
  Settings
} from "lucide-react";
import logo from "../../assets/opticam-logo.png";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function Sidebar({ user, onUpdateUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("opticam_user");
      navigate("/");
    }
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
          ? "bg-[var(--accent-blue)]/10 border-[var(--accent-blue)]/20 text-[var(--text-primary)] shadow-lg shadow-blue-500/5"
          : "hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]"
          }`}
      >
        <div className="flex items-center gap-3.5">
          <span className={`transition-transform duration-300 ${isActive ? "scale-110 text-[var(--accent-blue)]" : "group-hover:scale-110 group-hover:text-[var(--text-primary)]"} ${item.label === 'Day Pulse' ? 'text-rose-500 animate-pulse' : ''}`}>
            {item.icon}
          </span>
          <span className={`text-[15px] font-medium tracking-wide ${isActive ? "font-semibold" : ""} ${item.label === 'Day Pulse' ? 'bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent font-bold' : ''}`}>
            {item.label}
          </span>
        </div>
        {isActive && (
          <ChevronRight size={16} className="text-[var(--accent-blue)] opacity-100 transition-opacity" />
        )}
      </div>
    );
  };

  return (
    <>
      <aside className="w-[280px] h-[calc(100vh-4rem)] mt-1 mb-14 ml-2 flex flex-col sticky top-1 bg-[var(--bg-sidebar)] backdrop-blur-2xl border border-[var(--sidebar-border)] rounded-[32px] overflow-hidden z-50 font-sans shadow-2xl transition-all duration-300 ring-1 ring-[var(--border-color)]/50">

        {/* Subtle Inner Gradient for Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-tertiary)]/30 to-transparent pointer-events-none" />

        {/* Brand Section */}
        <div className="p-6 pb-2 bg-transparent sticky top-0 z-50">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>

            {/* Refined Logo Container */}
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] ring-1 ring-[var(--border-color)] flex items-center justify-center backdrop-blur-md shadow-sm group-hover:scale-105 transition-all duration-300">
              <img src={logo} alt="OptiCam Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-sans group-hover:text-[var(--text-primary)] transition-colors">
                Opti<span className="text-[var(--accent-blue)]">Cam</span>
              </h1>
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-secondary)] to-[var(--text-secondary)] font-medium tracking-wide">Optimisation In Campus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto space-y-8 custom-scrollbar relative z-10">

          {/* Main Menu */}
          <div>
            <p className="px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-3 opacity-80">Overview</p>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>

          {/* Productivity */}
          <div>
            <p className="px-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-3 opacity-80">Manage</p>
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>

        </nav>


        {/* Theme Toggle & User Profile Section (Bottom Fixed) */}
        <div className="p-3 mt-auto relative z-10 space-y-3 bg-gradient-to-t from-[var(--bg-sidebar)] via-[var(--bg-sidebar)] to-transparent pt-6">

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-amber-100 text-amber-500 shadow-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 shadow-indigo-500/20'} shadow-inner`}>
                {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[#1d9bf0] transition-colors">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                </p>
              </div>
            </div>
          </button>

          {/* User Profile Card - Premium Glassmorphism */}
          <div className="relative group">
            {/* Animated Glow Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1d9bf0] to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur-sm"></div>

            <div className="relative bg-[var(--bg-tertiary)] backdrop-blur-md border border-[var(--border-color)] rounded-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="relative shrink-0 cursor-pointer"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="w-10 h-10 rounded-full ring-2 ring-[var(--border-color)] group-hover:ring-[#1d9bf0] transition-all overflow-hidden shadow-sm">
                    <img
                      src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user.name}&backgroundColor=${theme === 'light' ? 'ffffff' : '000000'}`}
                      alt="Profile"
                      className="w-full h-full object-cover bg-[var(--bg-secondary)]"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-secondary)] rounded-full animate-pulse"></div>
                </div>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsModalOpen(true)}>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[#1d9bf0] transition-colors">
                    {user.name}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] truncate capitalize font-medium opacity-80">
                    {user.role} &bull; Online
                  </p>
                </div>

                <div
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[#1d9bf0] transition-colors cursor-pointer"
                >
                  <Settings size={18} />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wide text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 transition-all border border-transparent hover:border-red-500/20 active:scale-95"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
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
