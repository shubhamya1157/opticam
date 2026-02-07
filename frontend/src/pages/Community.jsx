import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useOutletContext } from "react-router-dom";
import {
    Users, Send, Plus, MessageSquare, MoreVertical, Paperclip, Smile,
    Image as ImageIcon, Search, Phone, Video, Mic, X, ChevronLeft,
    Menu, Trash2, Edit2, Info, User, LogOut, Check, CheckCheck, Clock, File,
    ArrowLeft, StopCircle, Play, Pause
} from "lucide-react";
import { fetchGroups, createGroup, updateGroup, deleteGroup, fetchMessages, sendMessage, uploadFile, deleteMessage, clearChat } from "../services/communityService";

const LockIcon = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10v8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z"></path></svg>
);

export default function Community() {
    const { user } = useOutletContext();
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [chatSearchQuery, setChatSearchQuery] = useState(""); // For searching inside chat

    // UI States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [topMenuOpen, setTopMenuOpen] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, messageId, groupId }
    const [replyingTo, setReplyingTo] = useState(null); // { id, content, senderName }

    // Audio Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [audioStream, setAudioStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingInterval = useRef(null);

    // Forms
    const [newGroupData, setNewGroupData] = useState({ name: "", description: "" });

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Common Emojis
    const emojis = ["😀", "😂", "😍", "🎉", "🔥", "👍", "👎", "👋", "🤔", "👀", "🚀", "💯", "❤️", "😭", "🙏"];

    // --- Effects ---
    useEffect(() => {
        if (user?._id) loadGroups();
    }, [user]);

    // Real-time Messaging
    useEffect(() => {
        if (!activeGroup) return;

        const socket = io("http://localhost:5001");

        socket.emit("join_group", activeGroup._id);

        socket.on("receive_message", (newMessage) => {
            if (newMessage.groupId === activeGroup._id) {
                setMessages((prev) => {
                    if (prev.some(m => m._id === newMessage._id)) return prev;
                    return [...prev, newMessage];
                });
            }
        });

        socket.on("message_deleted", (deletedMsgId) => {
            setMessages((prev) => prev.filter(m => m._id !== deletedMsgId));
        });

        socket.on("chat_cleared", () => {
            setMessages([]);
        });

        return () => {
            socket.disconnect();
        };
    }, [activeGroup]);

    useEffect(() => {
        setFilteredGroups(
            groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, groups]);

    useEffect(() => {
        if (activeGroup) {
            // loadMessages(); // Handled by Socket.io
            setChatSearchQuery("");
            setShowChatSearch(false);
            const interval = setInterval(loadMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [activeGroup]);

    useEffect(() => {
        if (messages.length > 0 && !chatSearchQuery) { // Don't auto scroll if searching
            const lastMsg = messages[messages.length - 1];
            if (activeGroup || lastMsg.senderId === user._id) {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, activeGroup?._id, chatSearchQuery]);

    // Cleanup audio stream on unmount
    useEffect(() => {
        return () => {
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
            if (recordingInterval.current) clearInterval(recordingInterval.current);
        };
    }, [audioStream]);


    // --- API Handlers ---
    const loadGroups = async () => {
        try {
            const res = await fetchGroups(user._id);
            setGroups(res.data.data);
        } catch (err) {
            console.error("Failed to load groups", err);
        }
    };

    const loadMessages = async () => {
        if (!activeGroup) return;
        try {
            const res = await fetchMessages(activeGroup._id);
            setMessages(res.data.data);
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupData.name) return;
        try {
            await createGroup({
                ...newGroupData,
                createdBy: user._id,
                branch: user.branch,
                section: user.section,
                year: user.year
            });
            setShowCreateModal(false);
            setNewGroupData({ name: "", description: "" });
            loadGroups();
        } catch (err) {
            alert("Failed to create group: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteGroup(groupId);
            setActiveGroup(null);
            loadGroups();
        } catch (err) { console.error(err); }
    };

    const handleDeleteMsg = async () => {
        if (!contextMenu) return;
        try {
            await deleteMessage(contextMenu.groupId, contextMenu.messageId, user._id);
            setContextMenu(null);
        } catch (err) {
            console.error(err);
            alert("Failed to delete message");
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeGroup) return;
        try {
            const content = newMessage;
            const replyToId = replyingTo ? replyingTo.id : null;

            setNewMessage("");
            setShowEmojiPicker(false);
            setReplyingTo(null);

            await sendMessage(activeGroup._id, {
                senderId: user._id,
                senderName: user.name,
                content,
                type: 'text',
                replyTo: replyToId
            });
            // loadMessages(); // Handled by Socket.io
        } catch (err) { console.error(err); }
    };

    const handleFileUpload = () => fileInputRef.current?.click();

    const onFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !activeGroup) return;

        setIsUploading(true);
        const interval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadRes = await uploadFile(formData);
            console.log("Upload Response:", uploadRes.data);

            // Robust destructuring: try .data.data, then .data, then default to empty
            const responseData = uploadRes.data.data || uploadRes.data || {};
            let { fileUrl, type } = responseData;

            // Fallback: If server didn't return type, derive from file
            if (!type) {
                if (file.type.startsWith('image/')) type = 'image';
                else if (file.type.startsWith('audio/')) type = 'audio';
                else if (file.type.startsWith('video/')) type = 'video';
                else type = 'file';
            }

            await sendMessage(activeGroup._id, {
                senderId: user._id,
                senderName: user.name,
                content: file.name,
                type: type,
                fileUrl: fileUrl
            });
            // loadMessages(); // Handled by Socket.io
            setUploadProgress(100);
        } catch (err) {
            console.error("Upload failed", err);
            alert(`Failed to upload file: ${err.message || err.response?.data?.message || "Unknown error"}`);
        } finally {
            clearInterval(interval);
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // --- Audio Recording Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);

            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            const chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);

            recorder.onstop = async () => {
                const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm";

                const blob = new Blob(chunks, { type: mimeType });
                const file = new File([blob], "voice-message.webm", { type: mimeType });

                // Upload logic
                setIsUploading(true);
                const formData = new FormData();
                formData.append("file", file);

                try {
                    const uploadRes = await uploadFile(formData);
                    // Handle diverse backend response structures
                    const responseData = uploadRes.data.data || uploadRes.data || {};
                    const fileUrl = responseData.fileUrl;

                    if (!fileUrl) throw new Error("No file URL returned from upload");

                    await sendMessage(activeGroup._id, {
                        senderId: user._id,
                        senderName: user.name,
                        content: "Voice Message",
                        type: 'audio',
                        fileUrl: fileUrl
                    });
                } catch (err) {
                    console.error("Audio upload failed", err);
                    alert("Failed to send voice message");
                } finally {
                    setIsUploading(false);
                }

                stream.getTracks().forEach(track => track.stop());
                setAudioStream(null);
                setMediaRecorder(null);
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingInterval.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(recordingInterval.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop(); // Stop but don't effectively save/send (needs logic tweak if we want to discard)
            // Ideally we'd disconnect the onstop handler or ignore the result.
            // Simplified: let it stop, but we'll reset state. 
            // Better: re-assign onstop to null before stopping.
            mediaRecorder.onstop = null;
            mediaRecorder.stop();
            audioStream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setAudioStream(null);
            setMediaRecorder(null);
            clearInterval(recordingInterval.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };


    const groupMessages = (msgs) => {
        const groups = [];
        let lastDate = null;

        // Filter messages if search query exists
        const displayMsgs = chatSearchQuery.trim()
            ? msgs.filter(m => m.content && m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
            : msgs;

        if (!Array.isArray(displayMsgs)) return [];

        displayMsgs.forEach((msg, idx) => {
            if (!msg || !msg.createdAt) return;
            const date = new Date(msg.createdAt).toLocaleDateString();
            if (date !== lastDate) {
                groups.push({ type: 'date', content: date });
                lastDate = date;
            }
            const isMe = msg.senderId === user._id;
            const prevMsg = displayMsgs[idx - 1];
            const nextMsg = displayMsgs[idx + 1];
            const isSameSenderAsPrev = prevMsg && prevMsg.senderId === msg.senderId;
            const isSameSenderAsNext = nextMsg && nextMsg.senderId === msg.senderId;
            const timeDiff = prevMsg ? (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) / 1000 / 60 : 0;
            const isGrouped = isSameSenderAsPrev && timeDiff < 2;
            groups.push({ type: 'message', data: msg, isMe, isGrouped, isLastInGroup: !isSameSenderAsNext });
        });
        return groups;
    };

    const renderDateLabel = (dateLike) => {
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();
        if (dateLike === today) return "Today";
        if (dateLike === yesterday) return "Yesterday";
        return dateLike;
    };

    return (
        <div className="flex w-full h-[calc(100vh-40px)] bg-[#000000] text-gray-100 font-['Outfit'] overflow-hidden">

            {/* --- LEFT SIDEBAR (CHATS) --- */}
            <div className={`w-[400px] border-r border-[#2f3336] flex flex-col bg-[#000000] shrink-0 z-20 ${activeGroup ? 'hidden md:flex' : 'flex w-full'}`}>

                {/* Header */}
                <div className="h-[70px] bg-[#09090b] px-4 flex items-center justify-between shrink-0 border-b border-[#2f3336]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#8b5cf6] p-[1.5px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-bold">
                                {user.name?.[0] || "U"}
                            </div>
                        </div>
                        <h1 className="text-xl font-bold font-['Outfit'] tracking-tight">Chats</h1>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                        {user.role === 'cr' && (
                            <button onClick={() => setShowCreateModal(true)} className="p-2 hover:bg-[#2f3336] rounded-full transition" title="New Group">
                                <Plus size={22} />
                            </button>
                        )}
                        <button className="p-2 hover:bg-[#2f3336] rounded-full transition">
                            <MoreVertical size={22} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-[#2f3336]">
                    <div className="bg-[#202327] rounded-lg flex items-center px-4 py-2 gap-3 focus-within:ring-1 focus-within:ring-[#1d9bf0] transition-all">
                        <Search size={18} className="text-gray-500" />
                        <input
                            placeholder="Search or start new chat"
                            className="bg-transparent outline-none text-[15px] w-full placeholder:text-gray-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-gray-500 opacity-60">
                            <MessageSquare size={40} className="mb-3" />
                            <p>No chats yet</p>
                        </div>
                    ) : (
                        filteredGroups.map(group => (
                            <div
                                key={group._id}
                                onClick={() => setActiveGroup(group)}
                                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors border-b border-[#2f3336] hover:bg-[#16181c] ${activeGroup?._id === group._id ? "bg-[#16181c]" : ""}`}
                            >
                                <div className="w-[50px] h-[50px] rounded-full bg-[#2f3336] flex items-center justify-center text-white font-bold text-xl shrink-0">
                                    {group.icon && group.icon !== '📢' ? group.icon : group.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-[16px] font-medium truncate text-gray-100">{group.name}</h3>
                                        <span className="text-[11px] text-gray-500">{/* Time */}</span>
                                    </div>
                                    <p className="text-[14px] leading-tight text-gray-500 truncate">{group.description || "Tap to chat"}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- RIGHT: CHAT AREA --- */}
            <div className={`flex-1 bg-[#0b0b0b] relative flex flex-col min-w-0 ${!activeGroup ? 'hidden md:flex' : 'flex w-full absolute md:relative inset-0 z-50'}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none"
                    style={{
                        backgroundImage: "url('https://camo.githubusercontent.com/854a93c27d64274c4f815da2b64a78272a51f9d50e2b347e3a9y9e7fsw73/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f613462653531326537313935623662373364313732363534613933333335322e706e67')",
                        backgroundSize: '400px'
                    }}>
                </div>

                {!activeGroup ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 px-6">
                        <div className="w-[300px] h-[300px] bg-[#1d9bf0]/5 rounded-full blur-[100px] absolute pointer-events-none"></div>
                        <div className="bg-[#16181c] p-6 rounded-full mb-6 ring-1 ring-white/10 shadow-2xl">
                            <MessageSquare size={48} className="text-[#1d9bf0]" />
                        </div>
                        <h2 className="text-3xl font-light text-white mb-4">OptiCam Web</h2>
                        <p className="text-gray-400 max-w-md text-sm leading-6">Send and receive messages seamlessly. <br />Keep your phone connected for the best experience.</p>
                        <div className="mt-8 flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <LockIcon size={12} /> End-to-end encrypted
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-[70px] bg-[#09090b] px-4 flex items-center justify-between shrink-0 border-b border-[#2f3336] relative z-20">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowGroupInfo(true)}>
                                <button className="md:hidden text-gray-400 mr-2" onClick={(e) => { e.stopPropagation(); setActiveGroup(null) }}>
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-[#2f3336] flex items-center justify-center text-white font-bold text-lg">
                                    {activeGroup.icon && activeGroup.icon !== '📢' ? activeGroup.icon : activeGroup.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-[16px]">{activeGroup.name}</h3>
                                    <p className="text-[12px] text-gray-400 truncate max-w-[200px] md:max-w-md">
                                        {activeGroup.members?.map(m => m.name).join(', ') || 'tap for info'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">

                                {showChatSearch ? (
                                    <div className="bg-[#202327] rounded-lg flex items-center px-3 py-1.5 animate-slide-in-right">
                                        <Search size={16} className="text-gray-500 mr-2" />
                                        <input
                                            autoFocus
                                            className="bg-transparent text-sm w-32 outline-none text-white"
                                            placeholder="Search..."
                                            value={chatSearchQuery}
                                            onChange={e => setChatSearchQuery(e.target.value)}
                                            onBlur={() => !chatSearchQuery && setShowChatSearch(false)}
                                        />
                                        <button onClick={() => { setShowChatSearch(false); setChatSearchQuery('') }}><X size={14} className="text-gray-500" /></button>
                                    </div>
                                ) : (
                                    <button className="text-gray-400 hover:text-white" onClick={() => setShowChatSearch(true)}><Search size={22} /></button>
                                )}

                                <button className="text-gray-400 hover:text-white" onClick={() => setTopMenuOpen(!topMenuOpen)}>
                                    <MoreVertical size={22} />
                                </button>
                                {topMenuOpen && (
                                    <div className="absolute top-16 right-4 bg-[#16181c] border border-[#2f3336] rounded-xl shadow-2xl py-2 w-52 z-50 overflow-hidden">
                                        <button onClick={() => { setShowGroupInfo(true); setTopMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm">Group Info</button>
                                        <button onClick={() => { setTopMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm">Select Messages</button>
                                        <button onClick={() => { setTopMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm">Mute Notifications</button>
                                        <button onClick={async () => {
                                            if (window.confirm("Clear all messages in this chat?")) {
                                                try {
                                                    await clearChat(activeGroup._id);
                                                    setTopMenuOpen(false);
                                                } catch (err) { console.error(err); }
                                            }
                                        }} className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm text-yellow-500">Clear Chat</button>

                                        {user.role === 'cr' && (
                                            <button onClick={() => { handleDeleteGroup(activeGroup._id); setTopMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm text-red-500">Delete Group</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 z-10 scroll-smooth custom-scrollbar">
                            {groupMessages(messages).length === 0 && chatSearchQuery ? (
                                <div className="text-center text-gray-500 mt-10">No messages found matching "{chatSearchQuery}"</div>
                            ) : groupMessages(messages).map((item, idx) => {
                                if (item.type === 'date') {
                                    return (
                                        <div key={idx} className="flex justify-center my-4 sticky top-2 z-20">
                                            <span className="bg-[#182229] border border-[#2f3336]/60 text-gray-300 text-[11px] px-3 py-1 rounded-full shadow-lg font-medium backdrop-blur-md">
                                                {renderDateLabel(item.content)}
                                            </span>
                                        </div>
                                    );
                                }
                                const { data: msg, isMe, isGrouped, isLastInGroup } = item;
                                return (
                                    <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"} group ${isGrouped ? 'mt-0.5' : 'mt-2'}`}>
                                        <div
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                setContextMenu({
                                                    x: e.pageX,
                                                    y: e.pageY,
                                                    messageId: msg._id,
                                                    groupId: activeGroup._id,
                                                    senderId: msg.senderId,
                                                    type: msg.type,
                                                    fileUrl: msg.fileUrl
                                                });
                                            }}
                                            className={`
                                                max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2.5 relative shadow-sm text-[15px] leading-6 cursor-pointer font-['Outfit'] transition-all duration-200 hover:scale-[1.01]
                                                ${isMe
                                                    ? 'bg-gradient-to-r from-[#3b82f6] via-[#2563eb] to-[#0ea5e9] text-white rounded-tr-none shadow-md border border-blue-400/20'
                                                    : 'bg-[#1e293b] text-[#38bdf8] rounded-tl-none'}
                                            `}
                                        >
                                            {!isMe && !isGrouped && (
                                                <div className="text-[12px] font-bold mb-1 cursor-pointer hover:underline bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text drop-shadow-sm">
                                                    {msg.senderName}
                                                </div>
                                            )}

                                            {/* Quoted Message */}
                                            {msg.replyTo && (
                                                <div className={`mb-2 p-2 rounded text-xs border-l-4 ${isMe ? 'bg-black/20 border-white/50' : 'bg-black/20 border-[#3b82f6]'}`}>
                                                    <p className={`font-bold ${isMe ? 'text-white/80' : 'text-[#3b82f6]'}`}>
                                                        {messages.find(m => m._id === msg.replyTo)?.senderName || "Unknown"}
                                                    </p>
                                                    <p className="truncate opacity-80">
                                                        {messages.find(m => m._id === msg.replyTo)?.content || "Message deleted"}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Media */}
                                            {msg.type === 'image' && msg.fileUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden mt-1 bg-black/20">
                                                    <img src={msg.fileUrl} alt="Shared" className="w-full h-auto object-cover max-h-[350px]" loading="lazy" />
                                                </div>
                                            )}
                                            {msg.type === 'file' && msg.fileUrl && (
                                                <div className="mb-2 bg-black/20 p-3 rounded-lg flex items-center gap-3 mt-1 border border-white/5 hover:bg-black/30 transition">
                                                    <div className="bg-[#2f3336] p-2 rounded-md"><File size={24} className="text-blue-400" /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-300 hover:underline truncate block">{msg.content || 'Attached File'}</a>
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Document</span>
                                                    </div>
                                                </div>
                                            )}
                                            {msg.type === 'video' && msg.fileUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden mt-1 bg-black/20">
                                                    <video controls src={msg.fileUrl} className="w-full h-auto object-cover max-h-[350px]" />
                                                </div>
                                            )}
                                            {msg.type === 'audio' && msg.fileUrl && (
                                                <div className="mb-1 flex items-center gap-3 min-w-[200px] mt-1">
                                                    <div className={`p-2 rounded-full cursor-pointer transition ${isMe ? 'bg-[#1d9bf0]' : 'bg-[#1d9bf0]'}`}>
                                                        {/* Simple Audio Player Placeholder - In real prod use a dedicated player component */}
                                                        <Play size={20} className="fill-white text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <audio controls src={msg.fileUrl} className="w-full h-8 opacity-90" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap gap-x-2 items-end">
                                                {msg.type === 'text' && <span className="whitespace-pre-wrap">{msg.content}</span>}
                                                <span className={`text-[10px] min-w-[50px] text-right ml-auto flex justify-end gap-1 select-none ${isMe ? "text-[#8696a0]" : "text-[#8696a0]"} -mb-0.5`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <CheckCheck size={14} className="text-[#53bdeb]" />}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-[#09090b] px-4 py-3 z-20 shrink-0 border-t border-[#2f3336]">
                            {/* Reply Preview */}
                            {replyingTo && (
                                <div className="flex items-center justify-between bg-[#16181c] p-2 rounded-lg mb-2 border-l-4 border-[#3b82f6]">
                                    <div className="text-sm">
                                        <p className="text-[#3b82f6] font-bold text-xs">Replying to {replyingTo.senderName}</p>
                                        <p className="text-gray-400 truncate max-w-xs">{replyingTo.content}</p>
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-[#2f3336] rounded-full"><X size={16} /></button>
                                </div>
                            )}

                            {isUploading && (
                                <div className="absolute top-[-4px] left-0 w-full h-1 bg-[#2f3336]">
                                    <div className="h-full bg-[#1d9bf0] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            )}

                            {isRecording ? (
                                <div className="flex items-center gap-4 animate-pulse">
                                    <div className="text-red-500 font-bold flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                        Recording {formatTime(recordingTime)}
                                    </div>
                                    <div className="flex-1"></div>
                                    <button onClick={cancelRecording} className="text-gray-400 hover:text-red-500 font-medium">Cancel</button>
                                    <button onClick={stopRecording} className="p-3 bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] transition">
                                        <Send size={24} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                                    <button className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-[#2f3336]" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                        <Smile size={26} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-[#2f3336]" onClick={handleFileUpload}>
                                        <Paperclip size={24} />
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={onFileChange} />

                                    <div className="flex-1 bg-[#202c33] rounded-2xl flex items-center px-4 py-2 my-1 border border-transparent focus-within:border-[#2f3336] transition-colors">
                                        <input
                                            type="text"
                                            placeholder={isUploading ? "Uploading file..." : "Type a message"}
                                            className="bg-transparent outline-none text-white w-full placeholder:text-gray-400 text-[15px] font-normal"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                                            disabled={isUploading}
                                        />
                                    </div>

                                    {newMessage.trim() ? (
                                        <button
                                            onClick={handleSendMessage}
                                            className="p-3 text-[#1d9bf0] hover:bg-[#1d9bf0]/10 rounded-full transition"
                                        >
                                            <Send size={24} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={startRecording}
                                            className="p-3 text-gray-400 hover:text-white hover:bg-[#2f3336] rounded-full transition"
                                        >
                                            <Mic size={24} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-[80px] left-6 bg-[#16181c] border border-[#2f3336] rounded-xl p-4 shadow-2xl grid grid-cols-5 gap-2 w-[300px] z-50">
                                    {emojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => { setNewMessage(prev => prev + emoji); }}
                                            className="text-2xl p-2 hover:bg-[#2f3336] rounded-lg transition"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* --- RIGHT INFO SIDEBAR --- */}
            {activeGroup && showGroupInfo && (
                <div className="w-[320px] bg-[#000000] border-l border-[#2f3336] shrink-0 flex flex-col z-30 animate-slide-in-right h-full absolute right-0 top-0 bottom-0 md:relative shadow-2xl">
                    <div className="h-[70px] px-6 flex items-center gap-4 border-b border-[#2f3336] shrink-0 bg-[#09090b]">
                        <button onClick={() => setShowGroupInfo(false)} className="text-gray-400 hover:text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition"><X size={20} /></button>
                        <h3 className="text-white font-medium text-[16px]">Contact Info</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-8 flex flex-col items-center border-b border-[#2f3336] gap-4 bg-[#09090b] mb-2">
                            <div className="w-[120px] h-[120px] rounded-full bg-[#2f3336] flex items-center justify-center text-white font-bold text-5xl shadow-xl ring-4 ring-[#16181c]">
                                {activeGroup.name[0]}
                            </div>
                            <div className="text-center">
                                <h2 className="text-white font-semibold text-xl mb-1">{activeGroup.name}</h2>
                                <p className="text-gray-500 text-sm">Group • {activeGroup.members?.length} participants</p>
                            </div>
                        </div>

                        <div className="p-4 bg-[#09090b] mb-2 border-b border-[#2f3336]">
                            <p className="text-[#1d9bf0] text-sm font-medium mb-1">Description</p>
                            <p className="text-gray-300 text-[14px] leading-relaxed">
                                {activeGroup.description || "No description provided."}
                            </p>
                            <p className="text-gray-600 text-xs mt-3">Created by {groups.find(g => g._id === activeGroup._id)?.members?.[0]?.name || 'Admin'} </p>
                        </div>

                        <div className="bg-[#09090b]">
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-gray-400 text-sm font-medium">{activeGroup.members?.length} Participants</span>
                                <Search size={16} className="text-gray-500 hover:text-white cursor-pointer" />
                            </div>

                            {(activeGroup.members || []).map((member, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-[#16181c] transition cursor-pointer group px-6">
                                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border border-[#2f3336]">
                                        {member.name ? member.name[0] : 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <p className="text-white text-[15px] font-normal truncate">{member.name || 'Unknown User'}</p>
                                            {member.role === 'cr' && <span className="text-[#005c4b] text-[10px] border border-[#005c4b] px-1 rounded text-xs">Admin</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setContextMenu(null)} />
                    <div
                        className="fixed bg-[#16181c] border border-[#2f3336] rounded-xl shadow-2xl z-[100] py-2 w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 200) }}
                    >
                        {(contextMenu.type === 'image' || contextMenu.type === 'video' || contextMenu.type === 'audio' || contextMenu.type === 'file') && (
                            <a
                                href={contextMenu.fileUrl}
                                target="_blank"
                                download
                                className="block w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm text-white flex items-center gap-3 transition"
                                onClick={() => setContextMenu(null)}
                            >
                                <Paperclip size={16} /> Download
                            </a>
                        )}

                        {/* Copy Text */}
                        {contextMenu.type === 'text' && (
                            <button
                                onClick={() => { navigator.clipboard.writeText(messages.find(m => m._id === contextMenu.messageId)?.content || ""); setContextMenu(null); }}
                                className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm text-white flex items-center gap-3 transition"
                            >
                                <File size={16} /> Copy Text
                            </button>
                        )}

                        {/* Reply */}
                        <button
                            onClick={() => {
                                setReplyingTo({
                                    id: contextMenu.messageId,
                                    content: contextMenu.type === 'text' ? messages.find(m => m._id === contextMenu.messageId)?.content : `[${contextMenu.type}]`,
                                    senderName: messages.find(m => m._id === contextMenu.messageId)?.senderName
                                });
                                setContextMenu(null);
                                fileInputRef.current?.focus(); // Focus input? logic needs element ref
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm text-white flex items-center gap-3 transition"
                        >
                            <MessageSquare size={16} /> Reply
                        </button>

                        {/* Delete (Only for sender or admin) */}
                        {(contextMenu.senderId === user._id || user.role === 'cr') && (
                            <button
                                onClick={handleDeleteMsg}
                                className="w-full text-left px-4 py-3 hover:bg-[#2f3336] text-sm text-red-500 flex items-center gap-3 transition border-t border-[#2f3336]"
                            >
                                <Trash2 size={16} /> Delete Message
                            </button>
                        )}

                        {(contextMenu.senderId !== user._id && user.role !== 'cr') && (
                            <div className="px-4 py-2 text-xs text-gray-500 italic">No actions available</div>
                        )}
                    </div>
                </>
            )}

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#16181c] border border-[#2f3336] rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Create New Group</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X /></button>
                        </div>
                        <input
                            className="w-full bg-black border border-[#2f3336] rounded-xl px-4 py-3 text-white mb-4 focus:border-[#1d9bf0] outline-none"
                            placeholder="Group Name"
                            value={newGroupData.name}
                            onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                        />
                        <textarea
                            className="w-full bg-black border border-[#2f3336] rounded-xl px-4 py-3 text-white mb-6 focus:border-[#1d9bf0] outline-none h-24 resize-none"
                            placeholder="Description (Optional)"
                            value={newGroupData.description}
                            onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                        />
                        <button
                            onClick={handleCreateGroup}
                            className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold py-3 rounded-xl transition"
                        >
                            Create Group
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
