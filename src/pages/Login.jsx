import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      // 🔥 Notify App.jsx
      window.dispatchEvent(new Event("storage"));

      toast.success("Login successful");

      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.error || "Invalid credentials ❌";

      toast.error(message);
    }
  };

  return (
    <div className="h-screen bg-black text-white">

      {/* 🔥 BRANDING TOP BAR */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-green-400 text-xl font-bold tracking-wide">
          SAI <span className="text-white">X</span>
        </h1>
      </div>

      {/* LOGIN CENTER */}
      <div className="flex items-center justify-center h-[85vh]">
        <div className="bg-gray-900 p-8 rounded-xl w-80 space-y-4">

          <h1 className="text-green-400 text-center text-xl font-bold">
            Login
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-800 text-white rounded"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-gray-800 text-white rounded"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-green-500 p-2 rounded text-black font-semibold hover:bg-green-600 transition"
          >
            Login
          </button>

          <p className="text-gray-400 text-sm text-center">
            Don’t have an account?{" "}
            <span
              className="text-green-400 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Signup
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}