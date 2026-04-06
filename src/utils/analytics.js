const getWeekFromDate = (date) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = (d - start) / (1000 * 60 * 60 * 24);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);

  return `Week ${week}`;
};

// 📈 Weekly Volume (FINAL FIXED)
export function getWeeklyVolume(workouts) {
  const map = {};

  workouts.forEach((w) => {
    if (!w.date) return;

    const week = getWeekFromDate(w.date);

    if (!map[week]) map[week] = 0;

    (w.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((set) => {
        map[week] +=
          (Number(set.reps) || 0) * (Number(set.weight) || 0);
      });
    });
  });

  const result = Object.keys(map).map((week) => ({
    week,
    volume: map[week],
  }));

  // 🔥 IMPORTANT → SORT WEEKS
  result.sort((a, b) => {
    const numA = parseInt(a.week.replace("Week ", ""));
    const numB = parseInt(b.week.replace("Week ", ""));
    return numA - numB;
  });

  return result;
}

// 🏋️ Most Trained
export function getMostTrained(workouts) {
  const count = {};

  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      if (!ex.name) return;
      count[ex.name] = (count[ex.name] || 0) + 1;
    });
  });

  return Object.keys(count).reduce(
    (a, b) => (count[a] > count[b] ? a : b),
    "-"
  );
}

// 📅 Consistency
export function getConsistency(workouts) {
  if (!workouts.length) return 0;

  // ✅ UNIQUE ACTIVE DAYS
  const activeDays = new Set(
    workouts.map((w) =>
      new Date(w.date).toISOString().split("T")[0]
    )
  ).size;

  // ✅ TOTAL DAYS RANGE
  const dates = workouts.map((w) => new Date(w.date));

  const first = new Date(Math.min(...dates));
  const last = new Date(Math.max(...dates));

  const totalDays =
    Math.ceil((last - first) / (1000 * 60 * 60 * 24)) + 1;

  if (totalDays <= 0) return 0;

  return Math.round((activeDays / totalDays) * 100);
}