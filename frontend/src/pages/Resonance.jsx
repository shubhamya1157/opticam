import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
    Search, Plus, Sparkles, Users, BookOpen, Code, Star, Clock, Tag,
    MessageSquare, Check, X, Loader2, Send, Trash2, Bell, Filter,
    ArrowRight, Zap, MessageCircle, CheckCircle2, MoreHorizontal,
    LayoutGrid, List, Layers, Phone, Video, Cpu, Activity, Globe,
    Radio, Hexagon, UserPlus
} from "lucide-react";
import { getTasks, createTask, requestConnection, getMyTasks, getMyRequests, approveConnection, rejectConnection, deleteTask, getCachedTasks, getCachedMyTasks, endConnection } from "../services/resonanceService";
import { io } from "socket.io-client";
import api from "../services/api";

// Ultra-Premium Components
import WarRoom from "../components/resonance/WarRoom";
import ActionCenter from "../components/resonance/ActionCenter";

// Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Resonance Component Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8 text-center font-mono md:ml-[300px] transition-all duration-300">
                    <div className="max-w-md">
                        <Activity size={48} className="text-red-500 mx-auto mb-6 animate-pulse" />
                        <h1 className="text-2xl font-black mb-2 tracking-tighter text-red-500">CRITICAL SYSTEM FAILURE</h1>
                        <p className="text-gray-500 mb-8 text-xs leading-relaxed uppercase tracking-wide border-t border-b border-white/5 py-4">
                            Resonance Module connection interrupted. <br />
                            Please check your neural link or credentials.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                        >
                            Reinitialize Sequence
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const SOCKET_URL = "http://localhost:5001";

// 🎨 CREATIVE CATEGORY REINVENTION
const CATEGORIES = [
    {
        value: "Study Help",
        original: "Study Help",
        icon: Cpu,
        color: "from-cyan-400 to-blue-600",
        accent: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/10",
        desc: "Get help with assignments and concepts"
    },
    {
        value: "Project Collaboration",
        original: "Project Collaboration",
        icon: Hexagon,
        color: "from-violet-500 to-fuchsia-600",
        accent: "text-violet-400",
        border: "border-violet-500/30",
        bg: "bg-violet-500/10",
        desc: "Team up for group projects"
    },
    {
        value: "Skill Exchange",
        original: "Skill Exchange",
        icon: Zap,
        color: "from-amber-400 to-orange-600",
        accent: "text-amber-400",
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
        desc: "Learn and teach skills"
    },
    {
        value: "General",
        original: "Other",
        icon: Radio,
        color: "from-emerald-400 to-teal-600",
        accent: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
        desc: "Other collaboration needs"
    }
];

export default function ResonanceWithBoundary() {
    return (
        <ErrorBoundary>
            <Resonance />
        </ErrorBoundary>
    );
}

function Resonance() {
    const { user } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMyTasks, setShowMyTasks] = useState(false);
    const [socket, setSocket] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [toasts, setToasts] = useState([]);

    // Socket initialization
    useEffect(() => {
        if (!user || user.name === "Guest") return; // Skip for guests
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);
        const userId = user._id || user.id;
        newSocket.emit("join_user_room", userId);

        newSocket.on("connection_request", (data) => {
            loadMyRequests();
            showToast(`🔔 Signal received from ${data.requester.name}`, "info");
        });

        // Instant Connect: Owner approved ME
        newSocket.on("connection_approved", (data) => {
            showToast(`✅ Uplink established with ${data.ownerName}`, "success");
            // Auto-open chat
            setTimeout(() => {
                setActiveChatUser({
                    _id: data.ownerId,
                    username: data.ownerName,
                    name: data.ownerName,
                    taskId: data.taskId
                });
            }, 800);
        });

        return () => newSocket.disconnect();
    }, [user]);



    // Data Loading with Cache Strategy
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // 1. Instant Load from Cache (Public)
                const cachedTasks = await getCachedTasks();
                if (cachedTasks && cachedTasks.length > 0) setTasks(cachedTasks);

                // 2. Fetch Fresh Data (Public)
                await loadTasks();

                // 3. Authenticated Data (Private)
                if (user && user.name !== "Guest") {
                    const cachedMyTasks = await getCachedMyTasks();
                    if (cachedMyTasks && cachedMyTasks.length > 0) setMyTasks(cachedMyTasks);

                    await Promise.allSettled([loadMyTasks(), loadMyRequests()]);
                }
            } catch (err) {
                console.error("Critical Resonance Load Error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [user, selectedCategory, searchQuery]); // Re-run when crucial dependencies change

    const loadTasks = async () => {
        try {
            const res = await getTasks({ category: selectedCategory, search: searchQuery });
            if (res.success) setTasks(res.data);
        } catch (err) {
            console.error("Failed to load public tasks:", err);
            // Don't set loading false here, let the main effect handle it or specific UI states
        }
    };

    const loadMyTasks = async () => {
        if (!user || user.name === "Guest") return;
        try {
            const res = await getMyTasks();
            if (res.success) setMyTasks(res.data);
        } catch (err) { console.error(err); }
    };

    const loadMyRequests = async () => {
        if (!user || user.name === "Guest") return;
        try {
            const res = await getMyRequests();
            if (res.success) setPendingRequests(res.data);
        } catch (err) { console.error(err); }
    };

    const showToast = (message, type = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    // Actions
    const handleCreateTask = async (taskData) => {
        if (!user || user.name === "Guest") {
            showToast("Access Denied: Please Login First", "error");
            return;
        }
        try {
            const res = await createTask(taskData);
            if (res.success) {
                setShowCreateModal(false);
                loadTasks();
                loadMyTasks();
                showToast("✨ Signal Broadcasted Successfully", "success");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Transmission Failed";
            showToast(msg, "error");
        }
    };

    const handleConnect = async (taskId) => {
        try {
            await requestConnection(taskId, "Initializing collaboration protocol...");
            showToast("🚀 Connection Packet Sent", "success");
        } catch (err) { showToast(err.message, "error"); }
    };

    const handleApprove = async (taskId, requesterId, requesterName) => {
        console.log("📝 handleApprove called:", { taskId, requesterId, requesterName });
        try {
            if (String(requesterId) === String(user._id || user.id)) {
                showToast("⚠️ Cannot connect with yourself", "error");
                return;
            }
            console.log("🚀 Calling approveConnection API...");
            await approveConnection(taskId, requesterId);
            console.log("✅ API call successful, refreshing data...");
            loadMyRequests();
            loadMyTasks();
            showToast(`✅ Connected with ${requesterName}!`, "success");

            // Instant Connect: I approved THEM
            setActiveChatUser({ _id: requesterId, username: requesterName, name: requesterName, taskId });
        } catch (err) {
            console.error("❌ handleApprove error:", err);
            showToast(err.message || "Failed to accept request", "error");
        }
    };

    const handleReject = async (taskId, requesterId) => {
        try {
            await rejectConnection(taskId, requesterId);
            loadMyRequests();
            showToast("Connection Terminated", "info");
        } catch (err) { showToast(err.message, "error"); }
    };

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Deep Space Background with WebGL-style Canvas */}
            <div className="fixed inset-0 bg-[#050505] -z-20" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1a1a2e_0%,_#000000_100%)] opacity-80 -z-10" />
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none -z-10" />

            {/* Animated Orbs (Simulating WebGPU particles) */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse -z-10" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse delay-1000 -z-10" />
            <div className="fixed top-[20%] right-[30%] w-[20%] h-[20%] bg-cyan-500/10 rounded-full blur-[100px] animate-blob -z-10" />

            <div className="relative z-0 max-w-[1920px] mx-auto p-6 lg:p-12">
                {/* Header */}
                <header className="flex flex-col xl:flex-row justify-between items-end mb-16 gap-8 xl:gap-0 relative z-0">
                    <div className="relative group">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex items-center gap-3 mb-2">
                            <Activity size={16} className="text-cyan-400 animate-pulse" />
                            <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-500/70 uppercase">
                                OPTICAM NETWORK /// ACTIVE
                            </span>
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white leading-none">
                            RESONANCE
                        </h1>
                        <p className="text-gray-400 mt-4 font-mono text-sm max-w-md border-l border-white/10 pl-4 py-1">
                            Connect with peers. <br />
                            <span className="text-cyan-500">Collaborate</span> on projects. <span className="text-blue-500">Achieve</span> together.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ActionCenter
                            user={user}
                            socket={socket}
                            requests={pendingRequests}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onOpenChat={(id, name) => setActiveChatUser({ _id: id, username: name, name })}
                        />
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        <UserButton user={user} setShowMyTasks={setShowMyTasks} />
                        <CreateButton onClick={() => setShowCreateModal(true)} />
                    </div>
                </header>

                {/* Cyber-Filter Bar */}
                <div className="sticky top-6 z-50 mb-12">
                    <div className="bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex flex-col md:flex-row items-center gap-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-5xl mx-auto ring-1 ring-white/5">

                        {/* Search Input */}
                        <div className="relative flex-1 w-full md:w-auto group min-w-0">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search signals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none py-3 pl-12 pr-20 text-sm text-white focus:ring-0 placeholder-gray-600 font-mono tracking-wide"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-700 font-mono hidden md:block border border-white/10 px-1.5 py-0.5 rounded">CMD+K</div>
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden md:block" />

                        {/* Category Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto px-2 pb-2 md:pb-0 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategory("")}
                                className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap ${!selectedCategory
                                    ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                All Categories
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.value ? "" : cat.value)}
                                    className={`relative px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all border ${selectedCategory === cat.value
                                        ? `bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]`
                                        : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block mr-2 ${selectedCategory === cat.value ? 'bg-cyan-400 animate-pulse' : 'bg-gray-700'}`} />
                                    {cat.value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                {showMyTasks ? (
                    <MyTasksDashboard
                        tasks={myTasks}
                        requests={pendingRequests}
                        onClose={() => setShowMyTasks(false)}
                        onApprove={handleApprove}
                        onDelete={async (id) => {
                            try {
                                const res = await deleteTask(id);
                                if (res.success) {
                                    loadTasks();
                                    loadMyTasks();
                                    showToast("Signal Purged", "info");
                                }
                            } catch (e) { showToast(e.message, "error"); }
                        }}
                        onOpenChat={(id, name) => setActiveChatUser({ _id: id, username: name, name, taskId: tasks.find(t => t.activeConnections.includes(id))?._id })}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {loading ? (
                            [...Array(8)].map((_, i) => <HoloSkeleton key={i} />)
                        ) : filteredTasks.map((task, idx) => (
                            <HoloCard
                                key={task._id}
                                task={task}
                                currentUserId={user?._id || user?.id}
                                onConnect={handleConnect}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onDelete={async (id) => {
                                    if (window.confirm("Confirm deletion of this signal?")) {
                                        try {
                                            const res = await deleteTask(id);
                                            if (res.success) {
                                                loadTasks();
                                                loadMyTasks();
                                                showToast("Signal Purged", "info");
                                            }
                                        } catch (e) { showToast(e.message, "error"); }
                                    }
                                }}
                                onOpenChat={(id, name) => setActiveChatUser({ _id: id, username: name, name })}
                                idx={idx}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Overlays */}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => <CyberToast key={t.id} {...t} />)}
            </div>

            {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateTask} />}

            {activeChatUser && (
                <WarRoom
                    user={activeChatUser}
                    currentUser={user}
                    taskId={activeChatUser.taskId}
                    socket={socket}
                    onClose={() => setActiveChatUser(null)}
                    onEndConnection={async (taskId, targetId) => {
                        try {
                            await endConnection(taskId, targetId);
                            showToast("Link Terminated & Frequency Cleared", "info");
                            loadMyTasks(); // Refresh to update UI
                            loadTasks();
                        } catch (err) {
                            showToast("Failed to sever link", "error");
                        }
                    }}
                />
            )}
        </div>
    );
}

// --- CREATIVE "OSM" COMPONENTS ---

function HoloCard({ task, currentUserId, onConnect, onDelete, onApprove, onReject, onOpenChat, idx }) {
    const isOwner = String(task.ownerId) === String(currentUserId);
    const category = CATEGORIES.find(c => c.value === task.category) || CATEGORIES[3];
    const isPending = task.connectionRequests?.some(r => String(r.userId) === String(currentUserId) && r.status === 'pending');
    const isConnected = task.activeConnections?.some(id => String(id) === String(currentUserId));

    // Check if there are incoming requests (for task owner)
    const incomingRequests = isOwner ? task.connectionRequests?.filter(r => r.status === 'pending') || [] : [];
    const hasIncomingRequests = incomingRequests.length > 0;

    return (
        <div className="group relative w-full h-full min-h-[320px] bg-[#0c0c0c] rounded-[30px] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden flex flex-col">

            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-${task.category === 'Cerebral Sync' ? 'cyan' : task.category === 'Fusion Core' ? 'violet' : task.category === 'Skill Matrix' ? 'amber' : 'emerald'}-500/10 text-${task.category === 'Cerebral Sync' ? 'cyan' : task.category === 'Fusion Core' ? 'violet' : task.category === 'Skill Matrix' ? 'amber' : 'emerald'}-500`}>
                            {CATEGORIES.find(c => c.value === task.category)?.icon && React.createElement(CATEGORIES.find(c => c.value === task.category).icon, { size: 18 })}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded">
                            {task.category}
                        </span>
                    </div>

                    <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_emerald] animate-pulse" />

                        {/* Delete Button for Owner */}
                        {isOwner && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task._id);
                                }}
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 w-8 h-8 rounded-full flex items-center justify-center hover:rotate-90"
                                title="Purge Signal"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 mb-6">
                    <h3 className="text-2xl font-black text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {task.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 font-medium">
                        {task.description}
                    </p>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {task.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                    #{tag.replace('#', '')}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Connection Logic */}
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4 relative z-20">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {task.ownerName?.[0]}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-xs font-bold text-gray-300 truncate max-w-[100px]">{task.ownerName}</span>
                            <span className="text-[8px] text-gray-600 font-mono uppercase tracking-wider">SIGNAL SOURCE</span>
                        </div>
                    </div>

                    {isOwner ? (
                        hasIncomingRequests ? (
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                                    <UserPlus size={10} />
                                    {incomingRequests.length} Request{incomingRequests.length > 1 ? 's' : ''}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const firstRequest = incomingRequests[0];
                                        onApprove(task._id, firstRequest.userId, firstRequest.userName);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold hover:shadow-lg hover:shadow-cyan-500/20 transition-all hover:scale-105"
                                    title="Accept Request"
                                >
                                    ✓ Accept
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const firstRequest = incomingRequests[0];
                                        onReject(task._id, firstRequest.userId);
                                    }}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all"
                                    title="Reject Request"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono shrink-0">
                                OWNER
                            </div>
                        )
                    ) : isConnected ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                onOpenChat(task.ownerId, task.ownerName);
                            }}
                            className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-110 hover:shadow-[0_0_20px_emerald] transition-all shrink-0"
                            title="Open Channel"
                        >
                            <MessageSquare size={18} fill="currentColor" />
                        </button>
                    ) : isPending ? (
                        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-mono shrink-0 flex items-center gap-1">
                            <Clock size={10} />
                            PENDING
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onConnect(task._id);
                            }}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all shrink-0 z-20 shadow-lg group-hover:bg-cyan-400"
                            title="Connect"
                        >
                            <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function CreateModal({ onClose, onSubmit }) {
    const [form, setForm] = useState({ title: "", description: "", category: CATEGORIES[0].value, tags: "" });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[30px] p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden group">

                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />

                <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter relative z-10">INITIATE SIGNAL</h2>
                <p className="text-gray-500 mb-10 font-mono text-xs uppercase tracking-widest relative z-10">Broadcast a new collaboration protocol</p>

                <div className="space-y-8 relative z-10">
                    <div className="group/input">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-500 mb-3 block flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                            Objective Title
                        </label>
                        <input
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 text-white placeholder-gray-800 focus:border-cyan-500/50 focus:bg-[#151515] focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all font-bold text-xl tracking-wide"
                            placeholder="Turn Quantum Theory into Reality..."
                            autoFocus
                        />
                    </div>

                    <div className="group/input">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-500 mb-3 block flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                            Mission Parameters
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 text-white placeholder-gray-800 focus:border-cyan-500/50 focus:bg-[#151515] focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[150px] leading-relaxed resize-none text-sm"
                            placeholder="Describe the objective, requirements, and expected outcomes..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-500 mb-3 block flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                Category
                            </label>
                            <div className="relative group/select">
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 text-white focus:outline-none appearance-none font-bold text-sm z-10 relative hover:bg-[#151515] focus:border-cyan-500/50 transition-colors cursor-pointer"
                                >
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-[#111] text-gray-300 py-2">{c.value}</option>)}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-20 group-hover/select:text-cyan-400 transition-colors">
                                    <List size={18} />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-500 mb-3 block flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                Tags
                            </label>
                            <input
                                value={form.tags}
                                onChange={e => setForm({ ...form, tags: e.target.value })}
                                className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 text-white focus:border-cyan-500/50 focus:bg-[#151515] focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all placeholder-gray-800 text-sm font-medium"
                                placeholder="#react, #quantum, #ai..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-12 pt-8 border-t border-white/5 relative z-10">
                    <button onClick={onClose} className="px-8 py-4 rounded-xl text-gray-500 hover:text-white font-bold tracking-wide transition-colors uppercase text-xs">
                        ABORT SEQUENCE
                    </button>
                    <button
                        onClick={() => onSubmit({ ...form, tags: form.tags.split(',').filter(Boolean) })}
                        className="flex-1 px-8 py-4 rounded-xl bg-white text-black font-black tracking-widest hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all uppercase text-sm"
                    >
                        Broadcast Signal
                    </button>
                </div>
            </div>
        </div>
    );
}

function MyTasksDashboard({ tasks, requests, onClose, onApprove, onOpenChat, onDelete }) {
    return (
        <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-3xl overflow-y-auto animate-in slide-in-from-bottom-10 duration-500">
            <div className="max-w-[1920px] mx-auto p-6 md:p-12">
                <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-8">
                    <div>
                        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-2">MISSION CONTROL</h2>
                        <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">MANAGE ACTIVE SIGNALS AND INCOMING TRANSMISSIONS</p>
                    </div>
                    <button onClick={onClose} className="w-16 h-16 rounded-full bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 transition-all hover:rotate-90 flex items-center justify-center">
                        <X size={32} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Requests Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_cyan]" />
                                Incoming Feed ({requests.length})
                            </h3>
                        </div>

                        {requests.length === 0 ? (
                            <div className="h-64 rounded-[30px] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center p-8 border-dashed group">
                                <div className="p-4 rounded-full bg-white/5 text-gray-700 mb-4 group-hover:scale-110 transition-transform">
                                    <Radio size={32} />
                                </div>
                                <p className="text-gray-600 font-mono text-xs uppercase tracking-wider">NO ACTIVE TRANSMISSIONS FOUND</p>
                            </div>
                        ) : requests.map((req, i) => (
                            <div key={i} className="p-8 rounded-[30px] bg-[#0c0c0c] border border-white/10 hover:border-cyan-500/50 transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">
                                            {req.requester.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-xl">{req.requester.name}</p>
                                            <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-wider">Requesting Uplink</p>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6">
                                        <p className="text-xs text-gray-400 font-mono"><span className="text-cyan-600">TARGET //</span> "{req.taskTitle}"</p>
                                    </div>
                                    <button
                                        onClick={() => onApprove(req.taskId, req.requester.id, req.requester.name)}
                                        className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                    >
                                        ESTABLISH LINK
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Active Tasks Column */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-mono uppercase tracking-widest text-emerald-400 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_emerald]" />
                                Active Operations ({tasks.length})
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tasks.map(task => (
                                <div key={task._id} className="group p-8 rounded-[30px] bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30 transition-all relative overflow-hidden h-full flex flex-col">
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button onClick={() => onDelete(task._id)} className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-[10px] uppercase font-bold text-emerald-400 border border-emerald-500/20 tracking-wider">
                                            {task.category}
                                        </span>
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-3 leading-tight group-hover:text-emerald-400 transition-colors">{task.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-8">{task.description}</p>

                                    {/* Connectivity */}
                                    <div className="mt-auto pt-6 border-t border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-3 hover:space-x-1 transition-all">
                                                {task.activeConnections?.map((conn, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onOpenChat(conn.userId, conn.userName);
                                                        }}
                                                        className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:scale-110 hover:border-emerald-500 transition-all relative z-10 shadow-lg group/avatar"
                                                        title={`Chat with ${conn.userName}`}
                                                    >
                                                        {conn.userName[0]}
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
                                                    </div>
                                                ))}
                                                {task.activeConnections?.length === 0 && <span className="text-xs font-mono text-gray-600 mt-3 uppercase tracking-wider">NO ACTIVE LINKS</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- HELPER COMPONENTS ---

function UserButton({ user, setShowMyTasks }) {
    return (
        <button onClick={() => setShowMyTasks(true)} className="flex items-center gap-3 pl-2 pr-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                {user?.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wider">{user?.name}</span>
                <span className="text-[9px] text-gray-500 font-mono">OPERATOR // ONLINE</span>
            </div>
        </button>
    );
}

function CreateButton({ onClick }) {
    return (
        <button onClick={onClick} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] z-10 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus size={28} strokeWidth={3} />
        </button>
    );
}

function CyberToast({ message, type }) {
    const isSuccess = type === "success";
    return (
        <div className="animate-in slide-in-from-right-full duration-500 px-6 py-4 rounded-xl bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 flex items-center gap-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden group min-w-[300px]">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSuccess ? 'bg-emerald-500 shadow-[0_0_15px_emerald]' : 'bg-red-500 shadow-[0_0_15px_red]'}`} />
            <div className={`p-2.5 rounded-full bg-opacity-10 ${isSuccess ? 'bg-emerald-500 text-emerald-500' : 'bg-red-500 text-red-500'}`}>
                {isSuccess ? <CheckCircle2 size={20} /> : <Zap size={20} />}
            </div>
            <div>
                <p className={`text-[10px] font-mono uppercase tracking-widest mb-0.5 ${isSuccess ? 'text-emerald-500' : 'text-red-500'}`}>System Alert</p>
                <p className="text-sm font-bold text-white">{message}</p>
            </div>
        </div>
    );
}

function HoloSkeleton() {
    return (
        <div className="h-[400px] rounded-[30px] bg-white/[0.02] border border-white/5 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
            <div className="p-8 space-y-6">
                <div className="flex justify-between">
                    <div className="w-24 h-8 bg-white/5 rounded-xl" />
                    <div className="w-20 h-4 bg-white/5 rounded-md" />
                </div>
                <div className="space-y-3">
                    <div className="w-full h-8 bg-white/5 rounded-lg" />
                    <div className="w-2/3 h-8 bg-white/5 rounded-lg" />
                </div>
                <div className="space-y-2 mt-8">
                    <div className="w-full h-4 bg-white/5 rounded-md" />
                    <div className="w-full h-4 bg-white/5 rounded-md" />
                    <div className="w-3/4 h-4 bg-white/5 rounded-md" />
                </div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5" />
                        <div className="space-y-2">
                            <div className="w-20 h-3 bg-white/5 rounded" />
                            <div className="w-12 h-2 bg-white/5 rounded" />
                        </div>
                    </div>
                    <div className="w-24 h-10 rounded-full bg-white/5" />
                </div>
            </div>
        </div>
    );
}
