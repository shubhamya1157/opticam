import { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare, ArrowDown, User } from "lucide-react";
import { io } from "socket.io-client";
import { useOutletContext } from "react-router-dom";
import api from "../../../services/api"; // Corrected path

const SOCKET_URL = "http://localhost:5001";

export default function ChatWidget({ targetUser, onClose, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Initialize Socket & Load History
    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // Join my own room to receive messages
        if (currentUser) {
            newSocket.emit("join_user_room", currentUser._id);
        }

        // Listen for incoming messages
        newSocket.on("receive_private_message", (msg) => {
            // Only add if it belongs to this conversation
            if (msg.sender === targetUser._id || msg.sender === currentUser._id) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        });

        fetchHistory();

        return () => newSocket.disconnect();
    }, [targetUser, currentUser]);

    // 2. Fetch Chat History
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/chat/history/${targetUser._id}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load chat history", err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Send Message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Optimistic Update
            const tempMsg = {
                _id: Date.now(), // temp id
                sender: currentUser._id,
                recipient: targetUser._id,
                content: newMessage,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage("");

            // API Call
            await api.post("/chat/send", {
                recipientId: targetUser._id,
                content: tempMsg.content
            });

        } catch (err) {
            console.error("Failed to send message", err);
            // Optionally remove the optimistic message on failure
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-32px)] bg-black border border-[#2f3336] rounded-t-2xl shadow-2xl flex flex-col z-50 animate-slide-up h-[500px]">

            {/* Header */}
            <div className="p-4 border-b border-[#2f3336] flex justify-between items-center bg-[#16181c] rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1d9bf0] flex items-center justify-center text-white font-bold text-xs">
                        {targetUser.username ? targetUser.username[0].toUpperCase() : <User size={14} />}
                    </div>
                    <div>
                        <h3 className="text-white text-sm font-bold">{targetUser.username || "Anonymous"}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-[#71767b] font-medium uppercase tracking-wide">Live Connection</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-[#71767b] hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black custom-scrollbar">
                {loading && <div className="text-center text-[#71767b] text-xs py-4">Loading secure channel...</div>}

                {!loading && messages.length === 0 && (
                    <div className="text-center text-[#71767b] text-xs py-8 flex flex-col items-center gap-2 opactiy-50">
                        <MessageSquare size={24} />
                        <p>Start the conversation with {targetUser.username}</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMe = msg.sender === currentUser._id;
                    return (
                        <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isMe
                                ? "bg-[#1d9bf0] text-white rounded-br-none"
                                : "bg-[#16181c] text-[#e7e9ea] border border-[#2f3336] rounded-bl-none"
                                }`}>
                                <p>{msg.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-100" : "text-[#71767b]"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#2f3336] bg-[#16181c] flex gap-2">
                <input
                    className="flex-1 bg-black border border-[#2f3336] rounded-full px-4 py-2.5 text-sm text-white placeholder-[#71767b] focus:border-[#1d9bf0] outline-none transition-all"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
