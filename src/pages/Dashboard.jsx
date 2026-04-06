import { useEffect, useMemo, useState } from "react";
import { useWorkoutStore } from "../store/useWorkoutStore";
import ConsistencyHeatmap from "../components/ConsistencyHeatmap";

import {
  getWeeklyVolume,
  getMostTrained,
  getConsistency,
} from "../utils/analytics";

import {
  getPR,
  getAllExercises,
  getBestPR,
} from "../utils/pr";

import { generateInsights } from "../utils/insights";
import { getNextWorkout } from "../utils/progression";

import ProgressChart from "../components/ProgressChart";
import { getExerciseProgress } from "../utils/getExerciseProgress";
import { getMostTrainedExercise } from "../utils/getMostTrainedExercise";

import { getCardioStats } from "../utils/cardioAnalytics";
import CardioChart from "../components/CardioChart";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { workouts = [], fetchWorkouts } = useWorkoutStore();

  const [selectedExercise, setSelectedExercise] = useState("");
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    fetchWorkouts(); // 🔥 always refresh
  }, [fetchWorkouts]);

  // =========================
  // 📊 DATA
  // =========================
  const totalWorkouts = workouts.length;

  const volumeData = useMemo(
    () => getWeeklyVolume(workouts),
    [workouts]
  );

  const mostTrained = useMemo(
    () => getMostTrained(workouts),
    [workouts]
  );

  const consistency = useMemo(
    () => getConsistency(workouts),
    [workouts]
  );

  const insights = useMemo(
    () => generateInsights(workouts),
    [workouts]
  );

  const progression = useMemo(
    () => (workouts.length ? getNextWorkout(workouts) : null),
    [workouts]
  );

  const cardioData = useMemo(
    () => getCardioStats(workouts),
    [workouts]
  );

  // ✅ FIXED RECENT WORKOUTS
  const recentWorkouts = useMemo(() => {
    if (!workouts.length) return [];

    return [...workouts]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) -
          new Date(a.createdAt || a.date)
      )
      .slice(0, 5);
  }, [workouts]);

  // =========================
  // 🔥 STREAK
  // =========================
 const streak = useMemo(() => {
  if (!workouts.length) return 0;

  // ✅ Step 1: Get unique dates (YYYY-MM-DD)
  const uniqueDates = [
    ...new Set(
      workouts.map((w) =>
        new Date(w.date).toISOString().split("T")[0]
      )
    ),
  ];

  // ✅ Step 2: Sort DESC
  const sortedDates = uniqueDates.sort(
    (a, b) => new Date(b) - new Date(a)
  );

  let count = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);

    const diff =
      (prev - curr) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      count++;
    } else {
      break;
    }
  }

  return count;
}, [workouts]);
  // =========================
  // 💪 EXERCISES
  // =========================
  const exerciseList = useMemo(
    () => getAllExercises(workouts),
    [workouts]
  );

  const selectedPR = selectedExercise
    ? getPR(workouts, selectedExercise)
    : 0;

  const bestPR = useMemo(
    () => getBestPR(workouts),
    [workouts]
  );

  useEffect(() => {
    if (workouts.length > 0 && !selectedExercise) {
      const defaultEx = getMostTrainedExercise(workouts);
      setSelectedExercise(defaultEx);
    }
  }, [workouts, selectedExercise]);

  useEffect(() => {
    if (!selectedExercise) return;
    const data = getExerciseProgress(workouts, selectedExercise);
    setProgressData(data);
  }, [selectedExercise, workouts]);

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white space-y-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Workouts" value={totalWorkouts} />
        <Card title="Consistency" value={`${consistency}%`} />
        <Card title="Most Trained" value={mostTrained || "-"} />
        <Card title="Streak 🔥" value={`${streak} days`} />
      </div>

      {/* HEATMAP */}
      <div className="bg-gray-900 p-5 rounded-xl shadow">
        <ConsistencyHeatmap workouts={workouts} />
      </div>

      {/* WEEKLY VOLUME */}
      <div className="bg-gray-900 p-5 rounded-xl">
        <h2 className="mb-3 font-semibold">Weekly Volume</h2>

        {volumeData.length < 2 ? (
          <p className="text-gray-400">
            Add workouts across weeks 📈
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* EXERCISE PROGRESS */}
      <div className="bg-gray-900 p-5 rounded-xl">
        <h2 className="mb-3 font-semibold">Exercise Progress</h2>

        <select
          className="mb-4 w-full p-2 rounded bg-gray-800"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {exerciseList.map((ex) => (
            <option key={ex}>{ex}</option>
          ))}
        </select>

        <ProgressChart data={progressData} />
      </div>

      {/* PR */}
      <div className="bg-gray-900 p-5 rounded-xl space-y-3">
        <p className="text-gray-400 text-sm">Personal Records</p>

        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded"
        >
          <option value="">Select Exercise</option>
          {exerciseList.map((ex) => (
            <option key={ex}>{ex}</option>
          ))}
        </select>

        {selectedExercise && (
          <p className="text-green-400 text-xl font-bold">
            {selectedPR} kg
          </p>
        )}

        <p className="text-yellow-400 text-sm">
          🔥 Best: {bestPR?.value || 0} kg ({bestPR?.name || "N/A"})
        </p>
      </div>

      {/* CARDIO */}
      <div className="bg-gray-900 p-5 rounded-xl">
        <h2 className="mb-3 font-semibold">Cardio Analytics</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 p-3 rounded">
            <p>Total Distance</p>
            <h2 className="text-green-400">
              {cardioData.reduce((a, b) => a + b.distance, 0)} km
            </h2>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <p>Total Duration</p>
            <h2 className="text-yellow-400">
              {cardioData.reduce((a, b) => a + b.duration, 0)} mins
            </h2>
          </div>
        </div>

        <CardioChart data={cardioData} />
      </div>

      {/* INSIGHTS */}
      <div className="bg-gray-900 p-5 rounded-xl">
        <h2 className="mb-3 font-semibold">AI Insights</h2>

        {insights.length === 0 ? (
          <p className="text-gray-400">
            Train more to unlock insights 🚀
          </p>
        ) : (
          insights.map((i, idx) => (
            <div key={idx} className="bg-gray-800 p-3 rounded mb-2">
              {i}
            </div>
          ))
        )}
      </div>

      {/* 🔥 RECENT WORKOUTS FIXED */}
      <div className="bg-gray-900 p-5 rounded-xl">
        <h2 className="mb-3 font-semibold">Recent Workouts</h2>

        {recentWorkouts.length === 0 ? (
          <p className="text-gray-400">No workouts yet</p>
        ) : (
          recentWorkouts.map((w) => (
            <div
              key={w._id}
              className="bg-gray-800 p-4 rounded-lg mb-3 hover:bg-gray-700 transition"
            >
              <p className="text-green-400 font-semibold">
                {w.splitType}
              </p>

              <p className="text-xs text-gray-400 mb-1">
                {new Date(w.date).toDateString()}
              </p>

              {w.splitType === "Cardio" && w.cardio && (
                <p className="text-yellow-400 text-sm">
                  🏃 {w.cardio.duration} min • {w.cardio.distance} km
                </p>
              )}

              {w.exercises?.length > 0 && (
                <p className="text-sm text-gray-400">
                  {w.exercises.length} exercises
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* NEXT WORKOUT */}
      {progression && (
        <div className="bg-gray-900 p-5 rounded-xl">
          <h2 className="mb-3 font-semibold">
            Next Workout Suggestion
          </h2>

          <div className="bg-gray-800 p-3 rounded">
            {progression.message || "Increase weight 💪"}
          </div>
        </div>
      )}
    </div>
  );
}

// CARD COMPONENT
function Card({ title, value }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow">
      <p className="text-sm text-gray-400">{title}</p>
      <h2 className="text-xl font-bold text-green-400">
        {value}
      </h2>
    </div>
  );
}