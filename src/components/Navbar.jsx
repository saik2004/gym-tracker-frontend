import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");

    // notify app
    window.dispatchEvent(new Event("storage"));

    toast.success("Logged out");

    navigate("/login");
  };

  return (
    <div className="bg-black border-b border-gray-800 text-white px-4 py-3">
      {/* TOP BAR */}
      <div className="flex justify-between items-center">
        {/* LOGO */}
        <Link
  to="/"
  className="text-xl font-bold tracking-wide text-green-400"
>
  SAI <span className="text-white">X</span>
</Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-green-400 transition">
            Dashboard
          </Link>

          <Link to="/add" className="hover:text-green-400 transition">
            Add Exercise
          </Link>

          <Link to="/logs" className="hover:text-green-400 transition">
            Logs Data
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-1 rounded-md text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden mt-4 bg-[#111] rounded-xl p-4 flex flex-col gap-4 shadow-lg">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="hover:text-green-400"
          >
            Dashboard
          </Link>

          <Link
            to="/add"
            onClick={() => setMenuOpen(false)}
            className="hover:text-green-400"
          >
            Add Exercise
          </Link>

          <Link
            to="/logs"
            onClick={() => setMenuOpen(false)}
            className="hover:text-green-400"
          >
            Logs Data

          </Link>

          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="bg-red-500 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
