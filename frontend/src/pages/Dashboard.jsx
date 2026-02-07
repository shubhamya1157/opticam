import { useState, useEffect } from "react";
import ClassCard from "../components/features/dashboard/ClassCard";
import PremiumTimeInput from "../components/common/PremiumTimeInput";
import { useOutletContext } from "react-router-dom";
import { fetchClasses, addClass, updateClassStatus, deleteClass } from "../services/classService";
import { CalendarPlus, CalendarOff, Clock, MapPin, Zap, TrendingUp, BookOpen, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useOutletContext();
  const [classes, setClasses] = useState([]);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({ subject: "", startTime: "", endTime: "", room: "" });
  const [loading, setLoading] = useState(true);
  const [nextClass, setNextClass] = useState(null);

  useEffect(() => {
    if (user && user.branch && user.section) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await fetchClasses(user.branch, user.section);
      const fetchedClasses = res.data;
      setClasses(fetchedClasses);
      calculateNextClass(fetchedClasses);
    } catch (err) {
      console.error("Failed to load classes", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextClass = (classList) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Sort classes by time
    const sorted = [...classList].sort((a, b) => {
      const [aH, aM] = a.startTime.split(':').map(Number);
      const [bH, bM] = b.startTime.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });

    const next = sorted.find(c => {
      const [h, m] = c.startTime.split(':').map(Number);
      return (h * 60 + m) > currentMinutes;
    });

    setNextClass(next || null);
  };

  const handleClassStatusUpdate = async (id, status) => {
    await updateClassStatus(id, status, user._id);
    loadClasses();
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass(id);
        setClasses(prev => prev.filter(c => c._id !== id));
      } catch (err) {
        console.error("Failed to delete class", err);
      }
    }
  };

  const handleAddClass = async () => {
    if (!newClass.subject || !newClass.startTime || !newClass.endTime) {
      alert("Please fill in all fields.");
      return;
    }

    if (newClass.startTime >= newClass.endTime) {
      alert("End time must be after start time.");
      return;
    }

    await addClass({
      ...newClass,
      userId: user._id,
      branch: user.branch,
      section: user.section
    });
    setShowAddClass(false);
    loadClasses();
    setNewClass({ subject: "", startTime: "", endTime: "", room: "" });
  };

  return (
    <>
      <div className="min-h-screen font-sans space-y-8">



        {/* 🔹 MAIN SECTION: SCHEDULE */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden min-h-[500px] relative shadow-2xl transition-all duration-300">

            {/* Header */}
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center sticky top-0 bg-[var(--bg-secondary)]/95 backdrop-blur-md z-10 transition-colors">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-wide uppercase flex items-center gap-3 transition-colors">
                  Academic Schedule
                  <span className="text-[10px] bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] px-2 py-0.5 rounded border border-[var(--accent-blue)]/20 font-bold tracking-widest">
                    {user.branch} • SEC {user.section}
                  </span>
                </h2>
                <p className="text-[var(--text-secondary)] text-xs mt-1 font-medium tracking-wide transition-colors">TODAY'S TIMELINE</p>
              </div>

              {user.role === 'cr' && (
                <button
                  onClick={() => setShowAddClass(true)}
                  className="bg-[var(--text-primary)] text-[var(--bg-secondary)] hover:opacity-90 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <CalendarPlus size={14} /> Add Class
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-20 text-[var(--text-secondary)] text-sm font-medium tracking-wide animate-pulse">SYNCING SCHEDULE...</div>
              ) : classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-tertiary)]/50 transition-colors">
                  <div className="w-16 h-16 bg-[var(--border-color)]/50 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <CalendarOff className="text-[var(--text-secondary)]" size={28} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 transition-colors">No Classes Scheduled</h3>
                  <p className="text-[var(--text-secondary)] text-xs max-w-xs transition-colors">
                    You're all caught up! No academic sessions for today.
                  </p>
                  {user.role === 'cr' && (
                    <p className="text-xs text-[var(--accent-blue)] mt-4 cursor-pointer hover:underline font-bold uppercase tracking-wide" onClick={() => setShowAddClass(true)}>
                      + Schedule a Class
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classes.map((cls, idx) => (
                    <div key={cls._id} className="relative group hover:scale-[1.01] transition-transform duration-300">
                      <ClassCard
                        classData={cls}
                        isCR={user.role === 'cr'}
                        onUpdateStatus={handleClassStatusUpdate}
                        onDelete={handleDeleteClass}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-scale-in">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-2xl w-full max-w-md shadow-2xl relative transition-colors">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wide transition-colors">New Session</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6 transition-colors">Schedule a new class for {user.branch} - {user.section}</p>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-2 block transition-colors">Subject Name</label>
                <input
                  placeholder="e.g. Advanced Algorithms"
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[#1d9bf0] transition-colors placeholder:text-[var(--text-secondary)] text-sm"
                  value={newClass.subject}
                  onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-2 block flex items-center gap-1 transition-colors"><Clock size={10} /> Start Time</label>
                  <PremiumTimeInput
                    value={newClass.startTime}
                    onChange={(val) => setNewClass({ ...newClass, startTime: val })}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-2 block flex items-center gap-1 transition-colors"><Clock size={10} /> End Time</label>
                  <PremiumTimeInput
                    value={newClass.endTime}
                    onChange={(val) => setNewClass({ ...newClass, endTime: val })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-2 block flex items-center gap-1 transition-colors"><MapPin size={10} /> Location</label>
                <input
                  placeholder="e.g. Room 302, Academic Block A"
                  className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[#1d9bf0] transition-colors placeholder:text-[var(--text-secondary)] text-sm"
                  value={newClass.room}
                  onChange={e => setNewClass({ ...newClass, room: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={() => setShowAddClass(false)}
                className="flex-1 text-[var(--text-secondary)] py-2.5 hover:text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 rounded-lg transition-colors font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                className="flex-1 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg py-2.5 font-bold text-xs uppercase hover:opacity-90 transition-all shadow-lg"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
