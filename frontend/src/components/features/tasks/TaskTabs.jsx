import { useState, useEffect } from "react";
import { Plus, Clock, Trophy, Trash2, X, AlertCircle } from "lucide-react";
import {
  fetchTasks,
  addTask,
  completeTask,
  deleteTask
} from "../../../services/taskService";

const badgeStyle = {
  daily: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  weekly: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  monthly: "bg-green-500/10 text-green-400 border border-green-500/20"
};

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500"
};

export default function TasksSection({ user }) {
  const [tasks, setTasks] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("daily");
  const [priority, setPriority] = useState("medium");
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (user?._id) {
      fetchTasks(user._id).then(res => setTasks(res.data));
    }
  }, [user]);

  const handleAdd = async () => {
    if (!title) return;

    const duration = hours * 60 + minutes;

    const res = await addTask({
      userId: user._id,
      title,
      type,
      priority,
      duration,
      note
    });

    setTasks([res.data, ...tasks]);
    setShowAdd(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setNote("");
    setHours(1);
    setMinutes(0);
    setPriority("medium");
    setType("daily");
  }

  const handleComplete = async (id) => {
    await completeTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden bg-[#09090b]">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} /> Your Missions
          </h2>
          <p className="text-gray-500 text-sm">Stay consistent, stay ahead.</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="group flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 text-sm"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> New Task
        </button>
      </div>

      {/* Task List */}
      <div className="grid gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {tasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <p className="text-gray-500 text-sm">No active tasks. Time to relax? 🌴</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task._id}
              className="group glass-card bg-white/[0.02] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:bg-white/[0.04] relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wide uppercase ${badgeStyle[task.type]}`}>
                      {task.type}
                    </span>
                    {task.priority === 'high' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                        <AlertCircle size={8} /> HIGH
                      </span>
                    )}
                  </div>

                  <h3 className="text-gray-200 font-semibold text-base leading-tight group-hover:text-blue-400 transition-colors truncate pr-2">
                    {task.title}
                  </h3>

                  {task.note && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {task.note}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-gray-500 text-[10px] mt-2.5 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-blue-500" />
                      {Math.floor(task.duration / 60)}h {task.duration % 60}m
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleComplete(task._id)}
                    className="w-7 h-7 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-200"
                    title="Complete"
                  >
                    <Trophy size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-200"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔹 PREMIUM ADD TASK MODAL 🔹 */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAdd(false)}
          ></div>

          {/* Modal Content */}
          <div className="glass-panel w-full max-w-lg p-0 rounded-3xl shadow-2xl relative overflow-hidden animate-slide-up border border-white/10">

            {/* Header Gradient */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="p-8 bg-[#0f1012]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white">New Mission 🚀</h3>
                  <p className="text-gray-500 text-sm">Define your next objective.</p>
                </div>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Title Input */}
                <div className="relative group">
                  <input
                    placeholder=" "
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="peer w-full bg-black/30 border border-white/10 text-white text-lg font-medium rounded-xl px-4 py-4 focus:outline-none focus:border-blue-500 transition-all placeholder-transparent"
                    autoFocus
                  />
                  <label className="absolute left-4 top-4 text-gray-500 text-base transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-[#0f1012] peer-focus:px-1 peer-focus:text-blue-500 peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-[#0f1012] peer-not-placeholder-shown:px-1">
                    Task Title
                  </label>
                </div>

                {/* Type & Priority Row */}
                <div className="grid grid-cols-2 gap-6">

                  {/* Priority Selection */}
                  <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Priority</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(p => (
                        <button
                          key={p}
                          onClick={() => setPriority(p)}
                          className={`flex-1 h-2 rounded-full transition-all duration-300 ${priority === p ? priorityColors[p] + ' shadow-[0_0_10px_currentColor]' : 'bg-gray-800'}`}
                          title={p.charAt(0).toUpperCase() + p.slice(1)}
                        />
                      ))}
                    </div>
                    <div className="text-right text-xs text-gray-400 mt-1 capitalize">{priority}</div>
                  </div>

                  {/* Type Selection */}
                  <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Frequency</label>
                    <div className="flex bg-black/30 rounded-lg p-1 border border-white/10">
                      {['daily', 'weekly'].map(t => (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${type === t
                            ? 'bg-white/10 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Duration Slider Equivalent (Visual) */}
                <div>
                  <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Duration</label>
                  <div className="flex gap-4">
                    <div className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between focus-within:border-blue-500 transition-colors">
                      <span className="text-gray-500 text-xs">HOURS</span>
                      <input
                        type="number" min="0" max="24"
                        value={hours}
                        onChange={e => setHours(+e.target.value)}
                        className="bg-transparent text-white font-mono text-xl w-12 text-right focus:outline-none appearance-none"
                      />
                    </div>
                    <div className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between focus-within:border-blue-500 transition-colors">
                      <span className="text-gray-500 text-xs">MINS</span>
                      <input
                        type="number" min="0" max="59"
                        value={minutes}
                        onChange={e => setMinutes(+e.target.value)}
                        className="bg-transparent text-white font-mono text-xl w-12 text-right focus:outline-none appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="relative group">
                  <textarea
                    placeholder=" "
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="peer w-full bg-black/30 border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all placeholder-transparent h-24 resize-none"
                  />
                  <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:text-xs peer-focus:bg-[#0f1012] peer-focus:px-1 peer-focus:text-blue-500 peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:bg-[#0f1012] peer-not-placeholder-shown:px-1">
                    Notes
                  </label>
                </div>

              </div>

              <button
                onClick={handleAdd}
                disabled={!title}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${title
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <Plus size={20} /> Create Mission
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
