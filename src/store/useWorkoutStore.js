import { create } from "zustand";
import API from "../services/api";

export const useWorkoutStore = create((set) => ({
  workouts: [],

  // 📥 Fetch workouts
  fetchWorkouts: async () => {
    try {
      const res = await API.get("/workouts");
      set({ workouts: res.data });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  },

  // ➕ Add workout (FIXED)
  addWorkout: async (data) => {
  try {
    const res = await API.post("/workouts", data);

    set((state) => ({
      workouts: [...state.workouts, res.data], // 🔥 IMPORTANT
    }));

    return res.data;
  } catch (error) {
    console.error("Add workout error:", error);
    throw error;
  }
}
}));