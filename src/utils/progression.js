export function getNextWorkout(history) {
  if (!history || history.length === 0) return null;

  const last = history[history.length - 1];

  if (!last.sets || last.sets.length === 0) return null;

  const repsArray = last.sets.map((s) => Number(s.reps) || 0);
  const weight = Number(last.sets[0].weight) || 0;

  const avgReps =
    repsArray.reduce((a, b) => a + b, 0) / repsArray.length;

  const minReps = Math.min(...repsArray);

  let nextReps = Math.round(avgReps);
  let nextWeight = weight;

  // 🧠 Progressive overload logic

  // ✅ If strong performance → increase weight
  if (minReps >= 12) {
    nextWeight += 2.5;
    nextReps = 8;
  }

  // 🔁 Rep progression
  else {
    if (last.difficulty === "Easy") {
      nextReps += 2;
    } else if (last.difficulty === "Moderate") {
      nextReps += 1;
    } else if (last.difficulty === "Hard") {
      nextReps = Math.max(6, nextReps - 1); // slight deload
    }
  }

  // ⚠️ Prevent unrealistic jumps
  if (nextReps > 15) nextReps = 15;

  return {
    target: `3 x ${nextReps} @ ${nextWeight}kg`,
    advice:
      last.difficulty === "Hard"
        ? "Focus on recovery before increasing weight"
        : "Progressing well — keep pushing 💪",
  };
}