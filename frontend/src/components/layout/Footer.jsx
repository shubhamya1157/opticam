import { useLocation } from "react-router-dom";
import { Mail, ShieldAlert, Heart, Terminal, Github, ExternalLink } from "lucide-react";

export default function Footer({ toggleSidebar, isSidebarOpen }) {
    const location = useLocation();

    // Hide footer on Login page
    if (location.pathname === "/") return null;

    return (
        <footer className="fixed bottom-0 left-0 w-full z-40 bg-[var(--bg-footer)] backdrop-blur-md border-t border-[var(--footer-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-all duration-300">
            <div className="w-full max-w-[1920px] mx-auto px-6 h-10 flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)] font-mono relative">

                {/* LEFT: Menu Toggle & Copyright & Version */}
                <div className="flex items-center gap-4">
                    {/* Toggle Button */}
                    <button
                        onClick={toggleSidebar}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 group"
                        title={isSidebarOpen ? "Close Sidebar" : "Open Menu"}
                    >
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isSidebarOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400 group-hover:bg-[#1d9bf0]'}`}></div>
                        <span className="uppercase tracking-widest font-bold text-[10px] group-hover:text-[#1d9bf0] transition-colors">Menu</span>
                    </button>

                    <div className="h-3 w-px bg-[var(--border-color)]"></div>

                    <span className="text-[var(--text-secondary)] hidden sm:inline">
                        &copy; 2026 OptiCam.
                    </span>
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
                        <span className="tracking-wide">v1.2.0-beta</span>
                    </div>
                </div>

                {/* CENTER: Creative Credits (Visible on larger screens) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)]">Created by</span>
                    <span className="text-[var(--text-primary)] font-mono font-bold bg-[var(--bg-secondary)] px-2 py-0.5 rounded border border-[var(--border-color)] text-[10px] hover:text-[#1d9bf0] transition-colors cursor-default shadow-sm hover:shadow-md">
                        TEAM 127.0.0.1
                    </span>
                </div>

                {/* RIGHT: Status & Support with Premium Icons */}
                <div className="flex items-center gap-6">

                    {/* Support / CR Links */}
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline opacity-70">Support:</span>
                        <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                            {['A', 'B', 'C'].map((section, idx) => (
                                <div key={section} className="flex items-center">
                                    <a
                                        href={`mailto:cr_${section.toLowerCase()}@iiitkota.ac.in`}
                                        className="hover:text-[var(--text-primary)] transition-colors hover:underline decoration-[#1d9bf0] decoration-2 underline-offset-4"
                                    >
                                        CR-{section}
                                    </a>
                                    {idx < 2 && <span className="text-[var(--border-color)] mx-2">/</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}
