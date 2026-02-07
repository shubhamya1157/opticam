import { useState, useEffect } from "react";
import { Bell, Check, X, MessageSquare, UserPlus, Trash2, Zap, Clock, Activity } from "lucide-react";

export default function ActionCenter({
    user,
    socket,
    requests = [], // Default to empty array to prevent crashes
    onApprove,
    onReject,
    onOpenChat
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Sync requests to notifications with defensive checks
        console.log("🔔 ActionCenter: Received requests:", requests);
        if (!Array.isArray(requests)) {
            console.warn("⚠️ ActionCenter: requests is not an array:", requests);
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const reqNotifs = requests.map(req => ({
            id: `req-${req.taskId}-${req.requester.id}`,
            type: 'request',
            data: req,
            timestamp: new Date(),
            read: false,
            priority: 'high'
        }));

        console.log("🔔 ActionCenter: Created notifications:", reqNotifs);

        setNotifications(prev => {
            const otherNotifs = prev.filter(n => n.type !== 'request');
            const newNotifs = [...otherNotifs, ...reqNotifs].sort((a, b) => b.timestamp - a.timestamp);
            console.log("🔔 ActionCenter: Final notifications:", newNotifs);
            return newNotifs;
        });

        setUnreadCount(requests.length);
    }, [requests]);

    useEffect(() => {
        if (!socket || !user || user.name === "Guest") return;

        const handleNewMsg = (msg) => {
            if (msg.sender !== user._id) {
                const newNotif = {
                    id: `msg-${msg._id}`,
                    type: 'message',
                    data: msg,
                    timestamp: new Date(),
                    read: false,
                    priority: 'medium'
                };
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            }
        };

        const handleConnectionAccepted = (data) => {
            console.log("✅ Connection accepted notification:", data);
            const newNotif = {
                id: `accepted-${Date.now()}`,
                type: 'accepted',
                timestamp: new Date(),
                data: {
                    userName: data.userName || data.requesterName,
                    taskTitle: data.taskTitle
                },
                read: false,
                priority: 'high'
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        const handleConnectionRejected = (data) => {
            console.log("❌ Connection rejected notification:", data);
            const newNotif = {
                id: `rejected-${Date.now()}`,
                type: 'rejected',
                timestamp: new Date(),
                data: {
                    userName: data.userName || data.requesterName,
                    taskTitle: data.taskTitle
                },
                read: false,
                priority: 'medium'
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        const handleConnectionEnded = (data) => {
            console.log("🔌 Connection ended notification:", data);
            const newNotif = {
                id: `ended-${Date.now()}`,
                type: 'ended',
                timestamp: new Date(),
                data: {
                    userName: data.userName,
                    taskTitle: data.taskTitle
                },
                read: false,
                priority: 'medium'
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socket.on("receive_private_message", handleNewMsg);
        socket.on('connection_accepted', handleConnectionAccepted);
        socket.on('connection_rejected', handleConnectionRejected);
        socket.on('connection_terminated', handleConnectionEnded);

        return () => {
            socket.off("receive_private_message", handleNewMsg);
            socket.off('connection_accepted', handleConnectionAccepted);
            socket.off('connection_rejected', handleConnectionRejected);
            socket.off('connection_terminated', handleConnectionEnded);
        };
    }, [socket, user]);

    return (
        <div className="relative z-[100]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-3 rounded-full transition-all duration-300 ${isOpen ? 'bg-white text-black rotate-90 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-cyan-500 rounded-full border-2 border-[#050505]" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-14 right-0 w-[400px] bg-[#0a0a0a] backdrop-blur-3xl border border-white/10 rounded-[30px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-top-4 duration-300 z-[100]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-cyan-400" />
                                <h3 className="text-sm font-bold text-white tracking-wider">Action Center</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-gray-400">
                                    {notifications.length} TOTAL
                                </span>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setNotifications([]);
                                            setUnreadCount(0);
                                        }}
                                        className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-[10px] font-bold transition-all flex items-center gap-1.5 group"
                                        title="Clear All Notifications"
                                    >
                                        <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {requests.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Bell size={24} className="text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">No Pending Requests</p>
                                    <p className="text-xs text-slate-600 mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                requests.map((req) => (
                                    <div key={`${req.taskId}-${req.requester.id}`} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20">
                                                    {req.requester.name[0]}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-0.5">
                                                    <UserPlus size={12} className="text-cyan-400" />
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-sm text-white font-medium">
                                                        <span className="text-cyan-400 font-bold">{req.requester.name}</span> wants to connect
                                                    </p>
                                                    <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">Just now</span>
                                                </div>

                                                <div className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-300 mb-2 font-mono">
                                                    Task: {req.taskTitle}
                                                </div>

                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            console.log("🔔 Accept clicked:", { taskId: req.taskId, requesterId: req.requester.id, name: req.requester.name });
                                                            try {
                                                                await onApprove(req.taskId, req.requester.id, req.requester.name);
                                                                console.log("✅ Approval successful");
                                                                setIsOpen(false);
                                                            } catch (error) {
                                                                console.error("❌ Approval failed:", error);
                                                            }
                                                        }}
                                                        className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95 hover:from-cyan-500 hover:to-blue-500"
                                                    >
                                                        ✓ Accept
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log("🔔 Reject clicked:", { taskId: req.taskId, requesterId: req.requester.id });
                                                            try {
                                                                onReject(req.taskId, req.requester.id);
                                                                console.log("✅ Rejection successful");
                                                            } catch (error) {
                                                                console.error("❌ Rejection failed:", error);
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 text-xs font-bold rounded-lg transition-all hover:scale-105"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
                            <button className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-mono">
                                Mark all as read
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function NotificationItem({ notif, onApprove, onReject, onOpenChat, onDelete }) {
    if (notif.type === 'request') {
        return (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notif.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all hover:rotate-12"
                    title="Delete notification"
                >
                    <Trash2 size={12} />
                </button>

                <div className="flex gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20">
                            {notif.data.requester.name[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-0.5">
                            <UserPlus size={12} className="text-cyan-400" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-sm text-white font-medium">
                                <span className="text-cyan-400 font-bold">{notif.data.requester.name}</span> requested to join
                            </p>
                            <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">Just now</span>
                        </div>

                        <div className="inline-block px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-300 mb-2 font-mono">
                            task: {notif.data.taskTitle}
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={onApprove}
                                className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
                            >
                                Accept Request
                            </button>
                            <button
                                onClick={onReject}
                                className="px-3 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 text-xs font-bold rounded-lg transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (notif.type === 'message') {
        return (
            <div
                onClick={onOpenChat}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group flex gap-4 items-start relative"
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notif.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all hover:rotate-12"
                    title="Delete notification"
                >
                    <Trash2 size={12} />
                </button>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                    <MessageSquare size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">New Message</h4>
                        <span className="text-[10px] text-gray-600 ml-2 whitespace-nowrap">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {notif.data.content}
                    </p>
                </div>

                <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            </div>
        );
    }

    if (notif.type === 'accepted') {
        return (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notif.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all hover:rotate-12"
                    title="Delete notification"
                >
                    <Trash2 size={12} />
                </button>
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-sm font-bold text-emerald-400">Request Accepted</h4>
                            <span className="text-[10px] text-gray-600 ml-2 whitespace-nowrap">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-gray-300">
                            <span className="text-emerald-400 font-semibold">{notif.data.userName}</span> accepted your connection request
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">Task: {notif.data.taskTitle}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (notif.type === 'rejected') {
        return (
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all group relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notif.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all hover:rotate-12"
                    title="Delete notification"
                >
                    <Trash2 size={12} />
                </button>
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                        <X size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-sm font-bold text-red-400">Request Declined</h4>
                            <span className="text-[10px] text-gray-600 ml-2 whitespace-nowrap">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-gray-300">
                            <span className="text-red-400 font-semibold">{notif.data.userName}</span> declined your connection request
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">Task: {notif.data.taskTitle}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (notif.type === 'ended') {
        return (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all group relative">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notif.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all hover:rotate-12"
                    title="Delete notification"
                >
                    <Trash2 size={12} />
                </button>
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                        <Zap size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h4 className="text-sm font-bold text-amber-400">Connection Ended</h4>
                            <span className="text-[10px] text-gray-600 ml-2 whitespace-nowrap">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-gray-300">
                            Session with <span className="text-amber-400 font-semibold">{notif.data.userName}</span> has been terminated
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">Task: {notif.data.taskTitle}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
