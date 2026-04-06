// ✅ PR for specific exercise
export const getPR = (workouts, exerciseName) => {
  let max = 0;

  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      if (
        ex.name?.toLowerCase() === exerciseName.toLowerCase()
      ) {
        (ex.sets || []).forEach((s) => {
          if (s.weight > max) {
            max = s.weight;
          }
        });
      }
    });
  });

  return max;
};

// 🔥 GET ALL EXERCISES (for dropdown)
export const getAllExercises = (workouts) => {
  const set = new Set();

  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      if (ex.name) set.add(ex.name);
    });
  });

  return Array.from(set);
};

// 🔥 GET BEST PR (overall)
export const getBestPR = (workouts) => {
  let best = { name: "", value: 0 };

  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      (ex.sets || []).forEach((s) => {
        if (s.weight > best.value) {
          best = {
            name: ex.name,
            value: s.weight,
          };
        }
      });
    });
  });

  return best;
};