export default function Card({ children }) {
  return (
    <div className="glass p-4 shadow-lg hover:scale-105 transition">
      {children}
    </div>
  );
}