import { MoreVertical, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { formatTime } from "../../../utils/timeUtils";

export default function ClassCard({ classData, isCR, onUpdateStatus, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'conducted': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'canceled': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className={`relative glass-card bg-white/[0.02] p-5 rounded-2xl transition-all duration-300 hover:bg-white/[0.05] hover:scale-[1.01] hover:shadow-lg group ${classData.status === 'canceled' ? 'opacity-70 grayscale' : ''}`}>

      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(classData.status)}`}>
              {classData.status === 'scheduled' ? 'Upcoming' : classData.status}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} /> {formatTime(classData.startTime)} - {formatTime(classData.endTime)}
            </span>
          </div>

          <h3 className={`font-bold text-xl text-white mb-1 group-hover:text-blue-400 transition-colors ${classData.status === 'canceled' ? 'line-through text-gray-500' : ''}`}>
            {classData.subject}
          </h3>

          <p className="text-sm text-gray-400 font-medium">
            Room: <span className="text-white bg-white/10 px-1.5 py-0.5 rounded text-xs">{classData.room}</span>
          </p>
        </div>

        {/* CR Actions Menu */}
        {isCR && (
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 w-40 glass-panel bg-[#09090b] rounded-xl shadow-2xl z-20 overflow-hidden py-1 animate-fade-in border border-white/10">
                  <button
                    onClick={() => { onUpdateStatus(classData._id, 'conducted'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-green-400 hover:bg-green-500/10 flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Mark Conducted
                  </button>
                  <button
                    onClick={() => { onUpdateStatus(classData._id, 'canceled'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <XCircle size={14} /> Mark Canceled
                  </button>
                  <button
                    onClick={() => { onUpdateStatus(classData._id, 'scheduled'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-400 hover:bg-white/5 transition-colors"
                  >
                    Reset Status
                  </button>
                  <div className="h-px bg-white/10 my-1 mx-2"></div>
                  <button
                    onClick={() => { onDelete(classData._id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-950/30 flex items-center gap-2 transition-colors"
                  >
                    <XCircle size={14} /> Delete Class
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
