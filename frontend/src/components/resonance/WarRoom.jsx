import { useState, useEffect, useRef } from "react";
import {
    X, Send, Paperclip, Smile, MoreVertical, Phone, Video,
    Minimize2, Check, CheckCircle2, Code, Image as ImageIcon,
    Mic, Download, Maximize2, Cpu, Zap
} from "lucide-react";
import api from "../../services/api";

export default function WarRoom({ user, currentUser, socket, onClose }) {
    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const endRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initial load & Socket setup
    useEffect(() => {
        if (!socket || !user || !currentUser) return;
        const loadHistory = async () => {
            try {
                const res = await api.get(`/chat/history/${user._id}`);
                if (res.data.success) {
                    setMsgs(res.data.data);
                    scrollToBottom(false);
                }
            } catch (err) { console.error(err); }
        };
        loadHistory();

        const msgHandler = (m) => {
            const myId = String(currentUser._id || currentUser.id);
            const targetId = String(user._id);
            const senderId = String(m.sender);
            const recipientId = String(m.recipient);

            if ((senderId === targetId && recipientId === myId) ||
                (senderId === myId && recipientId === targetId)) {
                setMsgs(prev => [...prev, m]);
                scrollToBottom(true);
            }
        };

        const typingHandler = (data) => {
            if (data.userId === user._id) {
                setIsTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
            }
        };

        socket.on("receive_private_message", msgHandler);
        socket.on("user_typing", typingHandler);

        return () => {
            socket.off("receive_private_message", msgHandler);
            socket.off("user_typing", typingHandler);
        };
    }, [socket, user, currentUser]);

    const scrollToBottom = (smooth = true) => {
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" }), 100);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const content = input.trim();
        setInput("");
        try {
            await api.post("/chat/send", { recipientId: user._id, content });
        } catch (err) { console.error(err); }
    };

    const handleInput = (e) => {
        setInput(e.target.value);
        if (socket) socket.emit("typing", { recipientId: user._id });
    };

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-300 ${isMaximized ? 'bg-black' : 'bg-black/60 backdrop-blur-md'}`}>
            <div
                className={`
                    relative bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex overflow-hidden transition-all duration-500
                    ${isMaximized ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[85vh] rounded-[2rem] animate-scale-in'}
                `}
            >
                {/* Decorative Elements (Cyberpunk/Neural feel) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />

                {/* Sidebar - Context & Tools */}
                <div className="hidden md:flex w-80 bg-black/40 border-r border-white/5 flex-col z-20">
                    {/* User Profile */}
                    <div className="p-8 flex flex-col items-center border-b border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-br from-cyan-500 to-blue-600">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                                    {user.username ? (
                                        <span className="text-3xl font-bold text-white z-10">{user.username[0]}</span>
                                    ) : <Zap className="text-white z-10" />}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 z-0" />
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-[#0a0a0a] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1 relative z-10">{user.username}</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-emerald-400 font-mono tracking-wider">NEURAL LINK ACTIVE</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <ActionBtn icon={Phone} label="Voice" />
                            <ActionBtn icon={Video} label="Visio" />
                        </div>
                    </div>

                    {/* Shared Data */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        <div>
                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 mb-4 flex items-center gap-2">
                                <Cpu size={12} /> System Resources
                            </h3>
                            <div className="space-y-3">
                                <ResourceItem label="Shared Tasks" value="3 Active" />
                                <ResourceItem label="Latency" value="12ms" />
                                <ResourceItem label="Encryption" value="AES-256" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70 mb-4 flex items-center gap-2">
                                <Paperclip size={12} /> Artifacts
                            </h3>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors cursor-pointer border-dashed">
                                <p className="text-xs text-gray-400">Drag files to upload</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chat Interface */}
                <div className="flex-1 flex flex-col relative z-10">
                    {/* Header */}
                    <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                            <div className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                                {user.username[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {user.username || user.name || "Unknown User"}
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                                        SECURE
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                    Online via OptiCam
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMaximized(!isMaximized)}
                                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                        <div className="flex flex-col items-center justify-center py-8 opacity-50">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Zap className="text-cyan-500" size={24} />
                            </div>
                            <p className="text-xs text-gray-400 font-mono tracking-wider">ENCRYPTED CHANNEL ESTABLISHED</p>
                        </div>

                        {msgs.map((m, i) => {
                            const isMe = String(m.sender) === String(currentUser._id || currentUser.id);
                            return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                    <div className={`flex flex-col max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                            px-6 py-4 rounded-2xl text-[15px] leading-relaxed relative overflow-hidden group
                                            ${isMe
                                                ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 text-white rounded-br-sm'
                                                : 'bg-white/5 border border-white/5 text-gray-200 rounded-bl-sm'
                                            }
                                        `}>
                                            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
                                            <div className="relative z-10">{m.content}</div>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 px-1">
                                            <span className="text-[10px] text-gray-600 font-mono">
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && <CheckCircle2 size={10} className="text-cyan-500" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Input Zone (Command Deck) */}
                    <div className="p-6 pt-0">
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-2 shadow-2xl relative">
                            {/* Attachment Menu Popup */}
                            {showAttachMenu && (
                                <div className="absolute bottom-full left-0 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 flex flex-col gap-1 shadow-xl animate-scale-in z-50">
                                    <AttachOption icon={ImageIcon} label="Image" />
                                    <AttachOption icon={Code} label="Code Block" />
                                    <AttachOption icon={Mic} label="Voice Note" />
                                </div>
                            )}

                            <form onSubmit={handleSend} className="flex items-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                    className={`p-3 rounded-xl transition-all ${showAttachMenu ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <PlusIcon size={20} className={showAttachMenu ? 'rotate-45' : ''} />
                                </button>

                                <input
                                    value={input}
                                    onChange={handleInput}
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600 py-3 font-medium"
                                    placeholder="Execute command or send message..."
                                />

                                <button type="button" className="p-3 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all">
                                    <Smile size={20} />
                                </button>

                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg disabled:opacity-50 disabled:shadow-none hover:opacity-90 hover:scale-105 transition-all"
                                >
                                    <Send size={18} fill="currentColor" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for cleaner code
function ActionBtn({ icon: Icon, label }) {
    return (
        <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group">
            <Icon size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
            <span className="text-[10px] text-gray-500 group-hover:text-white font-medium">{label}</span>
        </button>
    );
}

function ResourceItem({ label, value }) {
    return (
        <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-xs text-gray-500">{label}:</span>
            <span className="text-xs text-white font-mono">{value}</span>
        </div>
    );
}

function AttachOption({ icon: Icon, label }) {
    return (
        <button className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-lg text-gray-300 hover:text-white transition-colors w-40">
            <Icon size={16} />
            <span className="text-sm">{label}</span>
        </button>
    );
}

// Helper icon
function PlusIcon({ className, size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${className}`}
        >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}
