export function getMostTrainedExercise(workouts) {
  const count = {};

  workouts.forEach((w) => {
    w.exercises.forEach((ex) => {
      count[ex.name] = (count[ex.name] || 0) + 1;
    });
  });

  return Object.keys(count).sort((a, b) => count[b] - count[a])[0];
}