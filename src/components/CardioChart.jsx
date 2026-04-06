import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CardioChart({ data }) {
  if (!data.length) {
    return (
      <p className="text-gray-400">
        No cardio data yet 🏃
      </p>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded space-y-4">
      <h2 className="text-lg text-green-400">
        Cardio Progress
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="week" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="distance"
            stroke="#22c55e"
            name="Distance (km)"
          />

          <Line
            type="monotone"
            dataKey="duration"
            stroke="#facc15"
            name="Duration (min)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}