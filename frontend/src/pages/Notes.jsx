import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
    Plus, Trash2, Search, Pin, Palette, LayoutGrid, X,
    MoreVertical, Edit2
} from "lucide-react";
import { fetchNotes, addNote, updateNote, deleteNote } from "../services/noteService";

export default function Notes() {
    const { user } = useOutletContext();

    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentNoteId, setCurrentNoteId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category: "General",
        color: "#202020", // Default dark gray
        isPinned: false
    });

    // Premium Colors (Google Keep Dark Mode Palette)
    const colors = [
        { id: "#202020", name: "Default" },
        { id: "#5c2b29", name: "Red" },    // Red-ish
        { id: "#614a19", name: "Yellow" }, // Yellow-ish
        { id: "#345920", name: "Green" },  // Green-ish
        { id: "#16504b", name: "Teal" },   // Teal-ish
        { id: "#2d555e", name: "Blue" },   // Blue-ish
        { id: "#42275e", name: "Purple" }, // Purple-ish
        { id: "#5b2245", name: "Pink" },   // Pink-ish
        { id: "#442f19", name: "Brown" },  // Brown-ish
    ];

    useEffect(() => {
        if (user?._id) {
            loadNotes();
        }
    }, [user]);

    useEffect(() => {
        setFilteredNotes(
            notes.filter(note =>
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, notes]);

    const loadNotes = async () => {
        try {
            const res = await fetchNotes(user._id);
            setNotes(res.data);
        } catch (err) {
            console.error("Failed to load notes", err);
        }
    };

    const handleSave = async () => {
        if (!formData.title && !formData.content) return;
        if (!user?._id) {
            alert("User authentication error. Please refresh the page.");
            return;
        }

        try {
            if (editMode && currentNoteId) {
                const res = await updateNote(currentNoteId, formData);
                setNotes(notes.map(n => n._id === currentNoteId ? res.data : n));
            } else {
                const res = await addNote({ ...formData, userId: user._id });
                setNotes([res.data, ...notes]);
            }
            closeModal();
        } catch (err) {
            console.error("Failed to save note", err);
            const errMsg = err.response?.data?.msg || err.message || "Unknown error";
            alert(`Failed to save: ${errMsg}`);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this note?")) return;
        try {
            await deleteNote(id);
            setNotes(notes.filter(n => n._id !== id));
            if (currentNoteId === id) closeModal();
        } catch (err) {
            console.error("Failed to delete note", err);
        }
    };

    const handlePinToggle = async (note, e) => {
        e.stopPropagation();
        try {
            const updated = { ...note, isPinned: !note.isPinned };
            const res = await updateNote(note._id, { isPinned: updated.isPinned });
            setNotes(notes.map(n => n._id === note._id ? res.data : n));
        } catch (err) {
            console.error("Failed to toggle pin", err);
        }
    };

    const openEdit = (note) => {
        setFormData({
            title: note.title,
            content: note.content,
            category: note.category,
            color: note.color || "#202020",
            isPinned: note.isPinned
        });
        setCurrentNoteId(note._id);
        setEditMode(true);
        setShowModal(true);
    };

    const openCreate = () => {
        setFormData({
            title: "",
            content: "",
            category: "General",
            color: "#202020",
            isPinned: false
        });
        setEditMode(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentNoteId(null);
    };

    // Separate pinned and other notes
    const pinnedNotes = filteredNotes.filter(n => n.isPinned);
    const otherNotes = filteredNotes.filter(n => !n.isPinned);

    return (
        <div className="w-full h-[calc(100vh-140px)] flex flex-col font-sans animate-fade-in">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#202020] p-4 rounded-2xl shadow-lg mb-6 gap-4 sticky top-0 z-10 border border-white/5">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-10 h-10 bg-[#1d9bf0] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <LayoutGrid size={22} />
                    </div>
                    <h2 className="text-white text-xl font-bold tracking-tight">Keep Notes</h2>
                </div>

                <div className="flex-1 w-full md:max-w-xl relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1d9bf0] transition" size={20} />
                    <input
                        placeholder="Search notes..."
                        className="w-full bg-[#151515] text-white pl-12 pr-4 py-3 rounded-xl border border-transparent focus:border-[#1d9bf0]/50 outline-none transition-all shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button
                    onClick={openCreate}
                    className="bg-[#1d9bf0] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#188cd8] hover:shadow-[0_0_20px_rgba(29,155,240,0.4)] transition active:scale-95 w-full md:w-auto justify-center"
                >
                    <Plus size={20} /> Create
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                {pinnedNotes.length > 0 && (
                    <div className="mb-8">
                        <h6 className="text-[#1d9bf0] text-xs font-bold uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
                            <Pin size={12} className="fill-current" /> Pinned
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up">
                            {pinnedNotes.map(note => <NoteCard key={note._id} note={note} onClick={() => openEdit(note)} onPin={(e) => handlePinToggle(note, e)} onDelete={(e) => handleDelete(note._id, e)} />)}
                        </div>
                    </div>
                )}

                {pinnedNotes.length > 0 && otherNotes.length > 0 && (
                    <h6 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1 mt-6">Others</h6>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up delay-75">
                    {otherNotes.map(note => <NoteCard key={note._id} note={note} onClick={() => openEdit(note)} onPin={(e) => handlePinToggle(note, e)} onDelete={(e) => handleDelete(note._id, e)} />)}
                </div>

                {filteredNotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 opacity-60">
                        <LayoutGrid size={64} className="mb-4 text-gray-700" />
                        <p>No notes found. Capture your ideas!</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
                    <div
                        className="w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-white/10 animate-scale-in"
                        style={{ backgroundColor: formData.color }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex justify-between items-start p-4 pb-2">
                            <input
                                placeholder="Title"
                                className="bg-transparent text-white text-xl font-bold placeholder:text-white/50 w-full outline-none"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                            />
                            <button onClick={() => setFormData({ ...formData, isPinned: !formData.isPinned })} className={`p-2 rounded-full hover:bg-black/10 transition ${formData.isPinned ? 'text-white' : 'text-white/30'}`}>
                                <Pin size={20} className={formData.isPinned ? "fill-current" : ""} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-4 py-2 flex-1">
                            <textarea
                                placeholder="Take a note..."
                                className="w-full bg-transparent text-white/90 placeholder:text-white/40 resize-none outline-none min-h-[150px] text-[16px] leading-relaxed custom-scrollbar"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>

                        {/* Modal Footer (Colors & Actions) */}
                        <div className="p-3 bg-black/20 flex items-center justify-between">
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-[250px] custom-scrollbar hide-scrollbar">
                                <Palette size={18} className="text-white/50 mr-2 shrink-0" />
                                {colors.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setFormData({ ...formData, color: c.id })}
                                        className={`w-6 h-6 rounded-full border-2 transition hover:scale-110 shrink-0 ${formData.color === c.id ? 'border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: c.id }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={closeModal} className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium hover:bg-white/10 rounded-lg transition">Close</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold shadow-sm transition">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NoteCard({ note, onClick, onPin, onDelete }) {
    return (
        <div
            onClick={onClick}
            className="rounded-2xl p-5 cursor-pointer border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] shadow-sm hover:shadow-xl group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
            style={{ backgroundColor: note.color || '#202020' }}
        >
            <div className="mb-8">
                <h3 className="text-white font-bold text-lg mb-2 leading-tight line-clamp-2">{note.title}</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap line-clamp-6 leading-relaxed font-light">{note.content}</p>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                    onClick={onPin}
                    className={`p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm ${note.isPinned ? 'opacity-100' : ''}`}
                    title={note.isPinned ? "Unpin" : "Pin"}
                >
                    <Pin size={14} className={note.isPinned ? "fill-white" : ""} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 rounded-full bg-black/20 hover:bg-red-500 hover:text-white text-white/90 backdrop-blur-sm transition-colors"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/40 mt-auto">
                <span className="bg-black/10 px-2 py-0.5 rounded uppercase tracking-wider font-bold">{note.category}</span>
                {note.isPinned && <Pin size={12} className="fill-white/40" />}
            </div>
        </div>
    );
}
