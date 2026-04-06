import { useMemo } from "react";

export default function ConsistencyHeatmap({ workouts = [] }) {
  // =========================
  // 🧠 BUILD DATA
  // =========================
  const { grid, weeks } = useMemo(() => {
    const map = {};

    workouts.forEach((w) => {
      const date = new Date(w.date);
      const day = date.getDay(); // 0–6
      const week = Number(w.week);

      if (!map[week]) map[week] = {};
      map[week][day] = w.splitType;
    });

    const sortedWeeks = Object.keys(map)
      .map(Number)
      .sort((a, b) => a - b);

    return { grid: map, weeks: sortedWeeks };
  }, [workouts]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // =========================
  // 🎨 COLORS
  // =========================
  const getColor = (type) => {
    if (!type) return "bg-gray-700";
    if (type === "Cardio") return "bg-yellow-400";
    if (type === "Rest") return "bg-gray-700";
    return "bg-green-500";
  };

  return (
    <div className="w-full">
      {/* TITLE */}
      <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
        Last {weeks.length} Weeks Consistency
      </p>

      {/* MAIN */}
      <div className="flex gap-3">

        {/* =========================
            📅 DAYS (FIXED ALIGNMENT)
        ========================= */}
        <div className="flex flex-col gap-[6px] text-[10px] sm:text-xs text-gray-400">
          {days.map((d) => (
            <div
              key={d}
              className="h-4 sm:h-5 flex items-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* =========================
            📊 GRID
        ========================= */}
        <div className="overflow-x-auto w-full">
          <div className="flex gap-2 min-w-max">

            {weeks.map((week) => (
              <div key={week} className="flex flex-col items-center gap-[6px]">

                {/* CELLS */}
                {days.map((_, dayIndex) => {
                  const type = grid[week]?.[dayIndex];

                  return (
                    <div
                      key={dayIndex}
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded ${getColor(
                        type
                      )} transition hover:scale-110`}
                      title={`Week ${week} - ${days[dayIndex]} (${type || "Rest"})`}
                    />
                  );
                })}

                {/* WEEK LABEL */}
                <span className="text-[9px] sm:text-[10px] text-gray-500 mt-1">
                  W{week}
                </span>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-3 mt-4 text-[10px] sm:text-xs">
        <Legend color="bg-gray-700" label="Rest" />
        <Legend color="bg-green-500" label="Trained" />
        <Legend color="bg-yellow-400" label="Cardio" />
      </div>
    </div>
  );
}

// =========================
// 🎯 LEGEND
// =========================
function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded ${color}`} />
      {label}
    </div>
  );
}