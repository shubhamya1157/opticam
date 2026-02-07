import { useState, useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

export default function Layout() {
    const location = useLocation();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("opticam_user");
        return location.state?.user || (savedUser ? JSON.parse(savedUser) : { name: "Guest" });
    });

    useEffect(() => {
        if (location.state?.user) {
            setUser(location.state.user);
            localStorage.setItem("opticam_user", JSON.stringify(location.state.user));
        }
    }, [location.state]);

    useEffect(() => {
        if (user && user.name !== "Guest") {
            localStorage.setItem("opticam_user", JSON.stringify(user));
        }
    }, [user]);

    const handleUpdateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(location.pathname === '/dashboard');

    // Automatically manage sidebar state based on route
    useEffect(() => {
        if (location.pathname === '/dashboard') {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


    // Determine if we are on the dashboard
    const isDashboard = location.pathname === '/dashboard';
    const isCommunity = location.pathname === '/community';

    return (
        <div className="flex bg-black min-h-screen font-sans selection:bg-[#1d9bf0]/30 selection:text-white relative overflow-hidden">

            {/* 🟢 GLOBAL BACKGROUND EFFECTS */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#1d9bf0]/5 to-transparent"></div>
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
            </div>

            {/* 🟢 NAVIGATION BAR (SIDEBAR) */}
            {isSidebarOpen && (
                <Sidebar user={user} onUpdateUser={handleUpdateUser} />
            )}

            {/* 🟢 MAIN CONTENT AREA */}
            <main className="flex-1 h-screen overflow-y-auto relative z-10 scroll-smooth">

                {/* 🟢 CONTAINER WITH GAP */}
                {/* For Community, we remove all padding/gap to allow full screen takeover */}
                <div className={`w-full mx-auto flex ${isCommunity ? 'p-0 gap-0 max-w-full' : 'max-w-[1600px] gap-4 pl-2 pr-2 pb-2 pt-0'}`}>

                    {/* Note: Sidebar is outside this div in flex flow, but we can wrap content here */}

                    <div className="flex-1 flex flex-col min-h-screen">
                        {/* 🟢 TOP BAR (Only on Dashboard) */}
                        {isDashboard && (
                            <div className="mb-0">
                                <Topbar user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                            </div>
                        )}

                        {/* 🟢 DYNAMIC PAGE CONTENT */}
                        <div className={`flex-1 ${isCommunity ? 'pb-0' : 'pb-24'}`}>
                            <Outlet context={{ user, handleUpdateUser }} />
                        </div>
                    </div>

                </div>

            </main>
            {/* 🟢 FOOTER (Fixed) */}
            {/* Footer component already has fixed positioning, so we just render it. */}
            {/* Ideally, Footer should be relative if it's content-based, but current design is fixed pill. */}
            {/* We'll modify App.jsx to NOT render Footer globally, but let Layout handle it implies structure clarity. */}
            {/* However, the current Footer is fixed position. Let's keep it in App or Layout. */}
            {/* Moving it here makes "Layout" the source of truth for the app shell. */}
            <Footer toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        </div>
    );
}
