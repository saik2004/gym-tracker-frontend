export function generateInsights(workouts) {
  if (!workouts || workouts.length < 3) {
    return ["Log more workouts to unlock deeper insights 🚀"];
  }

  const insights = [];

  // =========================
  // 📅 CONSISTENCY BY DAY
  // =========================
  const dayMap = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  const dayCount = {};

  workouts.forEach((w) => {
    const day = new Date(w.date).getDay();
    dayCount[day] = (dayCount[day] || 0) + 1;
  });

  const sortedDays = Object.entries(dayCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2) // 🔥 top 2 only (cleaner)
    .map(([d]) => dayMap[d]);

  if (sortedDays.length) {
    insights.push(
      `You train most on ${sortedDays.join(", ")} 💪`
    );
  }

  // =========================
  // 📆 WEEKLY FREQUENCY
  // =========================
  const weeks = {};

  workouts.forEach((w) => {
    const week = w.week || "unknown";
    weeks[week] = (weeks[week] || 0) + 1;
  });

  const avgSessions =
    Object.values(weeks).reduce((a, b) => a + b, 0) /
    Object.keys(weeks).length;

  if (avgSessions >= 4) {
    insights.push("Great consistency! Training 4+ days/week 🔥");
  } else if (avgSessions >= 2) {
    insights.push("Moderate consistency — push for 4 days/week ⚡");
  } else {
    insights.push("Low training frequency — increase sessions 📈");
  }

  // =========================
  // 💪 MOST TRAINED EXERCISE
  // =========================
  const exerciseCount = {};

  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      if (!ex?.name) return;
      exerciseCount[ex.name] =
        (exerciseCount[ex.name] || 0) + 1;
    });
  });

  const topExercise = Object.keys(exerciseCount).sort(
    (a, b) => exerciseCount[b] - exerciseCount[a]
  )[0];

  if (topExercise) {
    insights.push(`You focus heavily on ${topExercise}`);
  }

  // =========================
  // 📉 VARIETY CHECK
  // =========================
  if (Object.keys(exerciseCount).length < 3) {
    insights.push(
      "Low exercise variety — add more movements 🧠"
    );
  }

  // =========================
  // 📈 PROGRESSION CHECK (RECENT BASED)
  // =========================
  const progressMap = {};

  workouts.forEach((w) => {
    (w.exercises || []).forEach((ex) => {
      const maxWeight = Math.max(
        ...(ex.sets || []).map((s) => s.weight || 0)
      );

      if (!progressMap[ex.name]) {
        progressMap[ex.name] = [];
      }

      progressMap[ex.name].push(maxWeight);
    });
  });

  Object.entries(progressMap).forEach(([name, values]) => {
    if (values.length < 2) return;

    const last = values[values.length - 1];
    const prev = values[values.length - 2];

    if (last > prev) {
      insights.push(`${name} strength improving 📈`);
    } else if (last < prev) {
      insights.push(`${name} strength dropped ⚠️`);
    }
  });

  // =========================
  // 🛌 REST CHECK (SMART)
  // =========================
  const dates = workouts
    .map((w) => new Date(w.date))
    .sort((a, b) => a - b);

  let noRestDays = true;

  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);

    if (diff > 1) {
      noRestDays = false;
      break;
    }
  }

  if (noRestDays && workouts.length > 5) {
    insights.push(
      "No rest days detected — ensure recovery 😴"
    );
  }

  return insights;
}