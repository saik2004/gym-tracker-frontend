export function getCardioStats(workouts) {
  const weekly = {};

  workouts.forEach((w) => {
    if (w.splitType !== "Cardio" || !w.cardio) return;

    const week = w.week || 0;

    if (!weekly[week]) {
      weekly[week] = {
        distance: 0,
        duration: 0,
      };
    }

    weekly[week].distance += w.cardio.distance || 0;
    weekly[week].duration += w.cardio.duration || 0;
  });

  const result = Object.keys(weekly).map((week) => ({
    week: `W${week}`,
    distance: weekly[week].distance,
    duration: weekly[week].duration,
  }));

  return result.sort((a, b) => a.week.localeCompare(b.week));
}