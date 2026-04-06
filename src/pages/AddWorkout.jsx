import { useState, useEffect } from "react";
import { useWorkoutStore } from "../store/useWorkoutStore";
import toast from "react-hot-toast";

export default function AddWorkout() {
  const { addWorkout, workouts, fetchWorkouts } = useWorkoutStore();

  const [form, setForm] = useState({
    date: "",
    week: "",
    splitType: "Upper A",
    exercises: [],
    cardio: {
      duration: "",
      distance: "",
      weight: "",
    },
  });

  useEffect(() => {
    fetchWorkouts();
    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, date: today }));
  }, [fetchWorkouts]);

  const nextWeek =
    workouts.length > 0
      ? Math.max(...workouts.map((w) => w.week || 0)) + 1
      : 1;

  // 🔥 CALORIES
  const calories =
    Number(form.cardio.distance) > 0 &&
    Number(form.cardio.weight) > 0
      ? Math.round(
          Number(form.cardio.distance) *
            Number(form.cardio.weight)
        )
      : 0;

  // =========================
  // ✅ SPLIT CHANGE
  // =========================
  const handleSplitChange = (value) => {
    setForm((prev) => ({
      ...prev,
      splitType: value,
      exercises:
        !["cardio", "rest"].includes(value.toLowerCase())
          ? [
              {
                name: "",
                sets: [
                  { reps: "", weight: "" },
                  { reps: "", weight: "" },
                  { reps: "", weight: "" },
                ],
                intensity: "Moderate",
              },
            ]
          : [],
      cardio: { duration: "", distance: "", weight: "" },
    }));
  };

  // ➕ ADD EXERCISE
  const addExercise = () => {
    setForm((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          name: "",
          sets: [
            { reps: "", weight: "" },
            { reps: "", weight: "" },
            { reps: "", weight: "" },
          ],
          intensity: "Moderate",
        },
      ],
    }));
  };

  // ❌ REMOVE
  const removeExercise = (index) => {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  // ✏️ UPDATE
  const updateExercise = (index, field, value) => {
    const updated = [...form.exercises];
    updated[index][field] = value;
    setForm({ ...form, exercises: updated });
  };

  const updateSet = (exIndex, setIndex, field, value) => {
    const updated = [...form.exercises];
    updated[exIndex].sets[setIndex][field] = value;
    setForm({ ...form, exercises: updated });
  };

  // =========================
  // 🚀 SUBMIT (FIXED)
  // =========================
  const handleSubmit = async () => {
    if (!form.date) return toast.error("Select date ❌");
    if (!form.week) return toast.error("Enter week ❌");

    if (form.splitType === "Cardio") {
      if (!form.cardio.duration)
        return toast.error("Enter duration ❌");
    }

    if (
      !["cardio", "rest"].includes(
        form.splitType.toLowerCase()
      ) &&
      form.exercises.length === 0
    ) {
      return toast.error("Add at least 1 exercise ❌");
    }

    const distance = Number(form.cardio.distance || 0);
    const weight = Number(form.cardio.weight || 0);

    const payload = {
      date: new Date(form.date).toISOString(),
      week: Number(form.week),
      splitType: form.splitType,
      exercises:
        form.splitType === "Cardio" ||
        form.splitType === "Rest"
          ? []
          : form.exercises.map((ex) => ({
              name: ex.name,
              intensity: ex.intensity,
              sets: ex.sets.map((s) => ({
                reps: Number(s.reps),
                weight: Number(s.weight),
              })),
            })),
      cardio:
        form.splitType === "Cardio"
          ? {
              duration: Number(form.cardio.duration),
              distance,
              calories:
                distance > 0 && weight > 0
                  ? Math.round(distance * weight)
                  : 0,
            }
          : null,
    };

    try {
      const toastId = toast.loading("Saving workout...");

      await addWorkout(payload); // ✅ instant update

      toast.success("Workout saved 💪", { id: toastId });

      // RESET
      setForm({
        date: new Date().toISOString().split("T")[0],
        week: "",
        splitType: "Upper A",
        exercises: [],
        cardio: { duration: "", distance: "", weight: "" },
      });
    } catch (err) {
      toast.error("Failed to save ❌");
    }
  };

  return (
    <div className="p-4 space-y-6 text-white">
      <h1 className="text-2xl font-bold">Add Workout</h1>

      {/* DATE */}
      <input
        type="date"
        className="p-2 bg-gray-800 w-full rounded"
        value={form.date}
        onChange={(e) =>
          setForm({ ...form, date: e.target.value })
        }
      />

      {/* WEEK */}
      <input
        type="number"
        placeholder={`Week (suggested ${nextWeek})`}
        className="p-2 bg-gray-800 w-full rounded"
        value={form.week}
        onChange={(e) =>
          setForm({ ...form, week: e.target.value })
        }
      />

      {/* SPLIT */}
      <select
        className="p-2 bg-gray-800 w-full rounded"
        value={form.splitType}
        onChange={(e) => handleSplitChange(e.target.value)}
      >
        <option>Upper A</option>
        <option>Lower A</option>
        <option>Upper B</option>
        <option>Lower B</option>
        <option>Cardio</option>
        <option>Rest</option>
      </select>

      {/* CARDIO */}
      {form.splitType === "Cardio" && (
        <div className="bg-gray-900 p-4 rounded-xl space-y-3">
          <input
            type="number"
            placeholder="Duration (minutes)"
            className="p-2 bg-gray-800 w-full rounded"
            value={form.cardio.duration}
            onChange={(e) =>
              setForm({
                ...form,
                cardio: {
                  ...form.cardio,
                  duration: e.target.value,
                },
              })
            }
          />

          <input
            type="number"
            placeholder="Distance (km)"
            className="p-2 bg-gray-800 w-full rounded"
            value={form.cardio.distance}
            onChange={(e) =>
              setForm({
                ...form,
                cardio: {
                  ...form.cardio,
                  distance: e.target.value,
                },
              })
            }
          />

          <input
            type="number"
            placeholder="Body weight (kg)"
            className="p-2 bg-gray-800 w-full rounded"
            value={form.cardio.weight}
            onChange={(e) =>
              setForm({
                ...form,
                cardio: {
                  ...form.cardio,
                  weight: e.target.value,
                },
              })
            }
          />

          {calories > 0 && (
            <p className="text-green-400 text-sm">
              🔥 Calories: {calories} kcal
            </p>
          )}
        </div>
      )}

      {/* EXERCISES */}
      {!["cardio", "rest"].includes(
        form.splitType.toLowerCase()
      ) && (
        <div className="space-y-4">
          {form.exercises.map((ex, i) => (
            <div key={i} className="bg-gray-900 p-4 rounded-xl space-y-3">
              
              <div className="flex justify-between items-center">
                <input
                  placeholder="Exercise name"
                  className="p-2 bg-gray-800 w-full rounded mr-2"
                  value={ex.name}
                  onChange={(e) =>
                    updateExercise(i, "name", e.target.value)
                  }
                />
                <button
                  onClick={() => removeExercise(i)}
                  className="text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* 🔥 MODERN INTENSITY UI */}
              <div className="flex gap-2">
                {["Easy", "Moderate", "Hard"].map((level) => (
                  <button
                    key={level}
                    onClick={() =>
                      updateExercise(i, "intensity", level)
                    }
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                      ex.intensity === level
                        ? level === "Easy"
                          ? "bg-green-500 text-black"
                          : level === "Moderate"
                          ? "bg-yellow-400 text-black"
                          : "bg-red-500 text-white"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {ex.sets.map((set, j) => (
                <div key={j} className="flex gap-2">
                  <input
                    placeholder="Reps"
                    className="p-2 bg-gray-800 w-1/2 rounded"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(i, j, "reps", e.target.value)
                    }
                  />
                  <input
                    placeholder="Weight"
                    className="p-2 bg-gray-800 w-1/2 rounded"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(i, j, "weight", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={addExercise}
            className="bg-blue-500 p-3 w-full rounded"
          >
            ➕ Add Exercise
          </button>
        </div>
      )}

      {/* SAVE */}
      <button
        onClick={handleSubmit}
        className="bg-green-500 p-3 w-full rounded"
      >
        Save Workout
      </button>
    </div>
  );
}