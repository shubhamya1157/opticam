import { useState, useEffect, useMemo } from "react";
import { Search, Send, ArrowRight, Zap, Activity, Hash, Globe, Cpu, Clock, Radio, Users, MessageSquare } from "lucide-react";
import { broadcastSignal, tuneSignals } from "../services/resonanceService";
import ChatWidget from "../components/features/resonance/ChatWidget";
import { useOutletContext } from "react-router-dom";

export default function Resonance() {
    const { user } = useOutletContext(); // Get current user
    const [params, setParams] = useState({ content: "", tags: "", contact: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [broadcasting, setBroadcasting] = useState(false);

    // Chat State
    const [activeChatUser, setActiveChatUser] = useState(null);

    const handleConnect = (signalUser, signalContact) => {
        // If they have a user ID, open in-app chat
        if (signalUser && signalUser._id && signalUser._id !== user._id) {
            setActiveChatUser({
                _id: signalUser._id, // Ensure we have the ID
                username: signalUser.username
            });
        } else if (signalContact) {
            // Fallback to external link if no ID (legacy support / external links)
            const link = signalContact.includes('@') ? `mailto:${signalContact}` : signalContact.startsWith('http') ? signalContact : `https://${signalContact}`;
            window.open(link, '_blank');
        }
    };

    // 🟢 1. FETCH ALL SIGNALS
    useEffect(() => {
        loadSignals();
    }, []);

    const loadSignals = async () => {
        setLoading(true);
        try {
            const res = await tuneSignals();
            if (res.success) setSignals(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🟢 2. CLIENT-SIDE MATCHING
    const filteredSignals = useMemo(() => {
        if (!searchQuery) return signals;
        const lowerQuery = searchQuery.toLowerCase();
        return signals.filter(signal => {
            const contentMatch = signal.content.toLowerCase().includes(lowerQuery);
            const tagMatch = signal.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            return contentMatch || tagMatch;
        });
    }, [signals, searchQuery]);

    // 🟢 3. BROADCAST SIGNAL
    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!params.content) return;

        setBroadcasting(true);
        try {
            const tagsArray = params.tags.split(',').map(t => t.trim()).filter(t => t);
            const res = await broadcastSignal({ ...params, tags: tagsArray });
            if (res.success) {
                setParams({ content: "", tags: "", contact: "" });
                loadSignals();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setBroadcasting(false);
        }
    };

    // 💾 PRESENCE
    useEffect(() => {
        const savedParams = localStorage.getItem("resonance_params");
        const savedQuery = localStorage.getItem("resonance_query");
        if (savedParams) setParams(JSON.parse(savedParams));
        if (savedQuery) setSearchQuery(savedQuery);
    }, []);

    useEffect(() => {
        localStorage.setItem("resonance_params", JSON.stringify(params));
    }, [params]);

    useEffect(() => {
        localStorage.setItem("resonance_query", searchQuery);
    }, [searchQuery]);

    return (
        <div className="min-h-screen font-sans bg-black text-white pb-20">
            {/* Background Texture (Subtle grid matching dashboard feel) */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* LEFT PANEL: BROADCAST STATION */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Header Card */}
                    <div className="bg-black border border-[#2f3336] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Radio size={80} className="text-[#1d9bf0]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight uppercase text-white mb-2 flex items-center gap-2">
                                Resonance <div className="w-2 h-2 bg-[#1d9bf0] rounded-full animate-pulse"></div>
                            </h1>
                            <p className="text-[#71767b] text-xs font-bold uppercase tracking-widest">
                                Global Signal Network
                            </p>
                        </div>
                        <div className="mt-6 flex items-center gap-4 text-[10px] font-mono text-[#71767b] border-t border-[#2f3336] pt-4">
                            <div className="flex items-center gap-1">
                                <Activity size={12} />
                                <span>ONLINE</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Globe size={12} />
                                <span>DECENTRALIZED</span>
                            </div>
                        </div>
                    </div>

                    {/* Broadcast Form */}
                    <div className="bg-black border border-[#2f3336] rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-4 border-b border-[#2f3336] bg-[#16181c]/50">
                            <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Cpu size={14} className="text-[#1d9bf0]" /> New Transmission
                            </h2>
                        </div>

                        <form onSubmit={handleBroadcast} className="p-6 space-y-5">
                            <div>
                                <textarea
                                    className="w-full bg-[#16181c] border border-[#2f3336] rounded-xl p-4 text-sm text-white focus:border-[#1d9bf0] outline-none transition-all resize-none h-32 placeholder-[#71767b]"
                                    placeholder="What's on your mind? Broadcast to the network..."
                                    value={params.content}
                                    onChange={e => setParams({ ...params, content: e.target.value })}
                                    maxLength={280}
                                />
                                <div className="flex justify-end mt-1">
                                    <span className={`text-[10px] font-bold ${params.content.length > 250 ? 'text-red-500' : 'text-[#71767b]'}`}>
                                        {280 - params.content.length}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center bg-[#16181c] border border-[#2f3336] rounded-lg px-3 py-2.5 focus-within:border-[#1d9bf0] transition-all">
                                        <Hash size={14} className="text-[#71767b] mr-2" />
                                        <input
                                            className="bg-transparent outline-none text-xs text-white w-full placeholder-[#71767b] font-medium"
                                            placeholder="Tags (e.g. design, dev)"
                                            value={params.tags}
                                            onChange={e => setParams({ ...params, tags: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center bg-[#16181c] border border-[#2f3336] rounded-lg px-3 py-2.5 focus-within:border-[#1d9bf0] transition-all">
                                        <Users size={14} className="text-[#71767b] mr-2" />
                                        <input
                                            className="bg-transparent outline-none text-xs text-white w-full placeholder-[#71767b] font-medium"
                                            placeholder="Contact / Link (Optional)"
                                            value={params.contact}
                                            onChange={e => setParams({ ...params, contact: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={broadcasting || !params.content}
                                className="w-full bg-white text-black hover:bg-[#eff3f4] font-bold py-3 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm uppercase tracking-wide"
                            >
                                {broadcasting ? <Activity size={16} className="animate-spin" /> : <Send size={16} />}
                                {broadcasting ? "Transmitting..." : "Broadcast"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT PANEL: SIGNAL FEED */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Search Bar */}
                    <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-md pb-2 pt-2">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71767b] group-focus-within:text-[#1d9bf0] transition-colors" size={18} />
                            <input
                                className="w-full bg-[#16181c] border border-[#2f3336] rounded-full pl-12 pr-6 py-3 text-white placeholder-[#71767b] focus:border-[#1d9bf0] focus:bg-black outline-none transition-all text-sm font-medium"
                                placeholder="Search frequencies..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {loading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Activity size={16} className="text-[#1d9bf0] animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feed List */}
                    <div className="space-y-4 min-h-[500px]">
                        {filteredSignals.length === 0 && !loading && (
                            <div className="border border-dashed border-[#2f3336] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                                <Radio size={40} className="text-[#2f3336] mb-4" />
                                <p className="text-[#71767b] font-bold text-sm uppercase tracking-wide">No Signals Found</p>
                                <p className="text-[#71767b] text-xs mt-1">Broadcast something to start the network.</p>
                            </div>
                        )}

                        {filteredSignals.map((signal) => (
                            <div
                                key={signal._id}
                                className="bg-black hover:bg-[#080808] border border-[#2f3336] p-5 rounded-xl transition-all duration-200 group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#16181c] border border-[#2f3336] flex items-center justify-center text-sm font-bold text-white">
                                            {signal.username ? signal.username[0].toUpperCase() : "?"}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm flex items-center gap-1">
                                                {signal.username || "Anonymous"}
                                                {signal.username === "Shubham" && <Zap size={12} className="text-[#1d9bf0] fill-[#1d9bf0]" />}
                                            </div>
                                            <div className="text-xs text-[#71767b] flex items-center gap-1">
                                                <Clock size={10} />
                                                <span>{new Date(signal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connect Button (Smart) */}
                                    <button
                                        onClick={() => handleConnect({ _id: signal.userId, username: signal.username }, signal.contact)}
                                        className="text-[#1d9bf0] bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1"
                                    >
                                        <MessageSquare size={12} />
                                        Connect
                                    </button>
                                </div>

                                <p className="text-[#e7e9ea] text-[15px] leading-relaxed mb-3 whitespace-pre-wrap ml-13 pl-1">
                                    {signal.content}
                                </p>

                                {signal.tags && signal.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 ml-13 pl-1">
                                        {signal.tags.map((tag, i) => (
                                            <span key={i} className="text-[11px] font-medium text-[#1d9bf0] hover:underline cursor-pointer">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* In-App Chat Widget */}
            {activeChatUser && (
                <ChatWidget
                    targetUser={activeChatUser}
                    currentUser={user}
                    onClose={() => setActiveChatUser(null)}
                />
            )}
        </div>
    );
}
