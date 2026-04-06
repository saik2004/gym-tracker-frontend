import { useEffect, useMemo, useState } from "react";
import { useWorkoutStore } from "../store/useWorkoutStore";
import { exportPDF } from "../utils/exportPdf";
import { motion } from "framer-motion";

export default function Logs() {
  const { workouts = [], fetchWorkouts } = useWorkoutStore();

  const [selectedWeek, setSelectedWeek] = useState("latest");

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // =========================
  // 🧠 NORMALIZE WEEK
  // =========================
  const normalizeWeek = (week) => {
    if (!week) return null;
    const num = parseInt(week);
    return isNaN(num) ? null : num;
  };

  // =========================
  // 📊 GET ALL WEEKS
  // =========================
  const weeks = useMemo(() => {
    const uniqueWeeks = workouts
      .map((w) => normalizeWeek(w.week))
      .filter(Boolean);

    return [...new Set(uniqueWeeks)].sort((a, b) => a - b);
  }, [workouts]);

  // =========================
  // 🔥 AUTO SELECT LATEST
  // =========================
  useEffect(() => {
    if (weeks.length > 0 && selectedWeek === "latest") {
      setSelectedWeek(weeks[weeks.length - 1]);
    }
  }, [weeks]);

  // =========================
  // 📊 FILTER WORKOUTS
  // =========================
  const filteredWorkouts = useMemo(() => {
    if (selectedWeek === "all") return workouts;

    const target = Number(selectedWeek);

    return workouts.filter(
      (w) => normalizeWeek(w.week) === target
    );
  }, [workouts, selectedWeek]);

  // =========================
  // 🚀 GROUP BY WEEK + SPLIT
  // =========================
  const grouped = useMemo(() => {
    return filteredWorkouts.reduce((acc, workout) => {
      const weekNum = normalizeWeek(workout.week);
      const weekKey = weekNum ? `Week ${weekNum}` : "Unknown";

      const splitKey = workout.splitType || "Other";

      if (!acc[weekKey]) acc[weekKey] = {};
      if (!acc[weekKey][splitKey]) acc[weekKey][splitKey] = [];

      acc[weekKey][splitKey].push(workout);

      return acc;
    }, {});
  }, [filteredWorkouts]);

  return (
    <div className="p-4 space-y-6 text-white">
      <h1 className="text-2xl font-bold">Workout Logs</h1>

      {/* FILTER + DOWNLOAD */}
      <div className="flex gap-3 items-center flex-wrap">
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="bg-gray-800 px-3 py-2 rounded-lg"
        >
          <option value="all">All Weeks</option>

          {weeks.map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>

        <button
          onClick={() => exportPDF(filteredWorkouts)}
          className="bg-green-500 px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition"
        >
          Download {selectedWeek === "all" ? "All" : `Week ${selectedWeek}`}
        </button>
      </div>

      {/* EMPTY */}
      {filteredWorkouts.length === 0 && (
        <p className="text-gray-400">No workouts found.</p>
      )}

      {/* LOGS */}
      {Object.keys(grouped).map((week) => (
        <div
          key={week}
          className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl space-y-6 shadow-lg"
        >
          {/* WEEK TITLE */}
          <h2 className="text-xl text-green-400 font-semibold">
            {week}
          </h2>

          {/* SPLIT GROUP */}
          {Object.keys(grouped[week]).map((split) => (
            <div key={split} className="space-y-4">

              {/* SPLIT TITLE */}
              <h3 className="text-lg text-blue-400 font-semibold border-l-4 border-blue-500 pl-3">
                {split}
              </h3>

              {/* WORKOUTS */}
              {grouped[week][split].map((workout, index) => (
                <motion.div
                  key={workout._id || index}
                  className="bg-gray-800/80 p-4 rounded-xl space-y-4 border border-white/5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* DATE */}
                  <p className="text-sm text-gray-400">
                    {new Date(workout.date).toDateString()}
                  </p>

                  {/* CARDIO */}
                  {split.toLowerCase() === "cardio" && workout.cardio && (
                    <div className="flex gap-4 text-sm mt-2">
                      <span className="text-yellow-400">
                        🏃 {workout.cardio.duration || 0} min
                      </span>

                      <span className="text-gray-300">
                        {workout.cardio.distance || 0} km
                      </span>

                      <span className="text-green-400 font-semibold">
                        🔥 {workout.cardio.calories || 0} kcal
                      </span>
                    </div>
                  )}

                  {/* EXERCISES */}
                  {(workout.exercises || []).map((ex, idx) => {
                    const level = ex.intensity || ex.difficulty;

                    const colorClass =
                      level === "Easy"
                        ? "bg-green-500 text-black"
                        : level === "Moderate"
                        ? "bg-yellow-400 text-black"
                        : level === "Hard"
                        ? "bg-red-500 text-white"
                        : "bg-gray-500 text-white";

                    return (
                      <div key={idx} className="space-y-3">
                        {/* HEADER */}
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-lg">{ex.name}</p>

                          {level && (
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${colorClass}`}
                            >
                              {level}
                            </span>
                          )}
                        </div>

                        {/* SETS */}
                        <div className="space-y-2">
                          {(ex.sets || []).map((set, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex justify-between items-center bg-gray-900/60 px-4 py-2 rounded-lg"
                            >
                              <span className="text-gray-400 text-sm">
                                Set {sIdx + 1}
                              </span>

                              <span className="text-white text-sm font-medium">
                                {set.reps} reps
                              </span>

                              <span className="text-green-400 text-sm font-semibold">
                                {set.weight} kg
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}