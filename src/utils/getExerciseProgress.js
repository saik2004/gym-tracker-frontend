export function getExerciseProgress(workouts, exerciseName) {
  if (!workouts || workouts.length === 0) return [];

  const progressMap = new Map();

  workouts.forEach((workout) => {
    const { date, exercises = [] } = workout;

    const targetExercise = exercises.find(
      (ex) =>
        ex.name?.toLowerCase() === exerciseName.toLowerCase()
    );

    if (!targetExercise) return;

    // ✅ Safe max weight calculation
    const maxWeight = Math.max(
      ...targetExercise.sets.map(
        (set) => Number(set.weight) || 0
      ),
      0
    );

    // ✅ Normalize date (remove time part)
    const cleanDate = new Date(date);
    cleanDate.setHours(0, 0, 0, 0);

    const key = cleanDate.toISOString();

    if (!progressMap.has(key)) {
      progressMap.set(key, maxWeight);
    } else {
      progressMap.set(
        key,
        Math.max(progressMap.get(key), maxWeight)
      );
    }
  });

  return Array.from(progressMap.entries())
    .map(([isoDate, weight]) => {
      const d = new Date(isoDate);

      return {
        // ✅ CLEAN LABEL FOR CHART
        date: d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),

        // ✅ Keep original date for sorting safety (optional)
        fullDate: isoDate,

        weight,
      };
    })
    .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
}