import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ProgressChart({ data, exercise }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded">
        No data for {exercise}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#333" />
        <XAxis dataKey="date" stroke="#aaa" />
        <YAxis stroke="#aaa" />
        <Tooltip />
        <Line dataKey="weight" stroke="#22c55e" />
      </LineChart>
    </ResponsiveContainer>
  );
}