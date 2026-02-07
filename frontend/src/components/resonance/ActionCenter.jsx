import { useState, useEffect } from "react";
import { Bell, Check, X, MessageSquare, UserPlus, Trash2, Zap, Clock } from "lucide-react";

export default function ActionCenter({
    user,
    socket,
    requests,
    onApprove,
    onReject,
    onOpenChat
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Sync requests to notifications with "Neural" metadata
        const reqNotifs = requests.map(req => ({
            id: `req-${req.taskId}-${req.requester.id}`,
            type: 'request',
            data: req,
            timestamp: new Date(),
            read: false,
            priority: 'high'
        }));

        setNotifications(prev => {
            const otherNotifs = prev.filter(n => n.type !== 'request');
            return [...otherNotifs, ...reqNotifs].sort((a, b) => b.timestamp - a.timestamp);
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

        socket.on("receive_private_message", handleNewMsg);
        return () => socket.off("receive_private_message", handleNewMsg);
    }, [socket, user]);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-3 rounded-2xl border transition-all duration-300 group ${isOpen ? 'bg-white/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
                <div className="relative">
                    <Bell size={20} className={`text-gray-400 group-hover:text-white transition-colors ${unreadCount > 0 ? 'animate-swing text-cyan-400' : ''}`} />
                    {unreadCount > 0 && (
                        <>
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-[#0a0a0a] z-10" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping opacity-75" />
                        </>
                    )}
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-4 w-[400px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 animate-scale-in origin-top-right ring-1 ring-white/5">
                        {/* Header */}
                        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="text-cyan-500" />
                                <h3 className="font-bold text-white text-sm tracking-wide">Action Center</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-gray-400 font-mono">
                                {unreadCount} PENDING
                            </span>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Bell size={24} className="text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">All systems nominal</p>
                                    <p className="text-xs text-slate-600 mt-1">No new signals received</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notif={notif}
                                        onApprove={async () => {
                                            await onApprove(notif.data.taskId, notif.data.requester.id, notif.data.requester.name);
                                            setIsOpen(false);
                                        }}
                                        onReject={() => onReject(notif.data.taskId, notif.data.requester.id)}
                                        onOpenChat={() => {
                                            const targetId = notif.type === 'message' ? notif.data.sender : notif.data.requester.id;
                                            const targetName = notif.data.senderName || "User";
                                            onOpenChat(targetId, targetName);
                                            setIsOpen(false);
                                        }}
                                    />
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

function NotificationItem({ notif, onApprove, onReject, onOpenChat }) {
    if (notif.type === 'request') {
        return (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

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
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group flex gap-4 items-start"
            >
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

    return null;
}
