import jsPDF from "jspdf";

export const exportPDF = (workouts) => {
  const doc = new jsPDF();

  let y = 15;

  const lineHeight = 6;

  const checkPage = () => {
    if (y > 270) {
      doc.addPage();
      y = 15;
    }
  };

  const addText = (text, size = 10, bold = false) => {
    checkPage();
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(text, 10, y);
    y += lineHeight;
  };

  const addSpace = (space = 4) => {
    y += space;
  };

  // =========================
  // 📊 GROUP DATA
  // =========================
  const grouped = workouts.reduce((acc, w) => {
    const week = `Week ${w.week}`;
    const split = w.splitType || "Other";

    if (!acc[week]) acc[week] = {};
    if (!acc[week][split]) acc[week][split] = [];

    acc[week][split].push(w);

    return acc;
  }, {});

  // =========================
  // 🧾 HEADER
  // =========================
  addText("Workout Report", 16, true);
  addSpace(4);

  // =========================
  // 📄 CONTENT
  // =========================
  Object.keys(grouped).forEach((week) => {
    addText(week, 14, true);
    addSpace(2);

    Object.keys(grouped[week]).forEach((split) => {
      addText(`• ${split}`, 12, true);
      addSpace(1);

      grouped[week][split].forEach((workout) => {
        // ✅ CLEAN DATE
        const cleanDate = new Date(
          workout.date
        ).toDateString();

        addText(`  ${cleanDate}`, 10);
        addSpace(1);

        // 🏃 CARDIO
        if (split.toLowerCase() === "cardio" && workout.cardio) {
          addText(
            `    🏃 ${workout.cardio.duration || 0} min  •  ${workout.cardio.distance || 0} km  •  ${workout.cardio.calories || 0} kcal`
          );
          addSpace(3);
          return;
        }

        // 💪 EXERCISES
        workout.exercises?.forEach((ex) => {
          addText(`    ${ex.name}`, 11, true);

          if (ex.intensity) {
            addText(`      (${ex.intensity})`, 9);
          }

          ex.sets?.forEach((set, i) => {
            addText(
              `      Set ${i + 1}: ${set.reps} reps - ${set.weight} kg`
            );
          });

          addSpace(2);
        });

        addSpace(2);
      });

      addSpace(3);
    });

    addSpace(4);
  });

  // =========================
  // 💾 SAVE
  // =========================
  doc.save("Workout_Report.pdf");
};