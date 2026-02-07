import { useEffect, useState } from "react";
import { Trophy, Clock } from "lucide-react";
import { fetchAchievements } from "../../../services/taskService";

export default function AchievementsSection() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchAchievements().then(res => setAchievements(res.data));
  }, []);

  return (
    <div className="bg-[#0f1419] p-6 rounded-2xl mt-6">
      <h2 className="text-white font-semibold text-lg mb-4">
        Achievements 🏆
      </h2>

      {achievements.length === 0 && (
        <p className="text-gray-400 text-sm">
          Complete tasks to earn achievements.
        </p>
      )}

      <div className="grid gap-4">
        {achievements.map(a => (
          <div
            key={a._id}
            className="bg-black p-4 rounded-xl border border-gray-800"
          >
            <h3 className="text-white font-medium">
              {a.title}
            </h3>

            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {Math.floor(a.duration / 60)}h {a.duration % 60}m
              </div>

              <div className="flex items-center gap-1 text-yellow-400">
                <Trophy size={14} /> +{a.points} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
