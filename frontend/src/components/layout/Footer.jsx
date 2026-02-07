import { useLocation } from "react-router-dom";
import { Mail, ShieldAlert, Heart, Terminal } from "lucide-react";

export default function Footer({ toggleSidebar, isSidebarOpen }) {
    const location = useLocation();

    // Hide footer on Login page
    if (location.pathname === "/") return null;

    return (
        <footer className="fixed bottom-0 left-0 w-full z-40 bg-[#09090b]/90 backdrop-blur-md border-t border-white/5">
            <div className="w-full max-w-[1920px] mx-auto px-6 h-10 flex items-center justify-between text-[11px] font-medium text-gray-500 font-mono relative">

                {/* LEFT: Menu Toggle & Copyright & Version */}
                <div className="flex items-center gap-4">
                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                        title={isSidebarOpen ? "Close Sidebar" : "Open Menu"}
                    >
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isSidebarOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600 group-hover:bg-blue-400'}`}></div>
                        <span className="uppercase tracking-widest font-bold text-[10px] group-hover:text-blue-400 transition-colors">Menu</span>
                    </button>

                    <div className="h-3 w-px bg-white/10"></div>

                    <span className="text-gray-400">
                        &copy; 2026 OptiCam. All rights reserved.
                    </span>
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                        <span className="traking-wide">v1.2.0-beta</span>
                    </div>
                </div>

                {/* CENTER: Creative Credits */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] uppercase tracking-widest text-gray-600">Created by</span>
                    <span className="text-gray-300 font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[10px] hover:text-[#1d9bf0] transition-colors cursor-default">
                        TEAM 127.0.0.1
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-gray-600">with</span>
                    <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-black text-[10px] uppercase tracking-wide animate-pulse">
                        LOT'S OF EFFORT
                    </span>
                </div>

                {/* RIGHT: Status & Support */}
                <div className="flex items-center gap-6">


                    {/* Support / CR Links */}
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline">Support:</span>
                        <div className="flex items-center gap-3 text-gray-400">
                            <a href="mailto:cr_a@iiitkota.ac.in" className="hover:text-white transition-colors">CR-A</a>
                            <span className="text-gray-800">/</span>
                            <a href="mailto:cr_b@iiitkota.ac.in" className="hover:text-white transition-colors">CR-B</a>
                            <span className="text-gray-800">/</span>
                            <a href="mailto:cr_c@iiitkota.ac.in" className="hover:text-white transition-colors">CR-C</a>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}
