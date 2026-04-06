import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await API.post("/auth/register", {
        email,
        password,
      });

      toast.success("Account created");
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.error || "Signup failed ❌";

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* 🔥 BRANDING TOP BAR */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-green-400 text-xl font-bold tracking-wide">
          SAI <span className="text-white">X</span>
        </h1>
      </div>

      {/* CENTER BOX */}
      <div className="flex items-center justify-center h-[calc(100vh-72px)]">
        <div className="bg-gray-900 p-8 rounded-xl w-80 space-y-4 shadow-lg">

          <h1 className="text-green-400 text-center text-xl font-bold">
            Signup
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-gray-800 text-white rounded outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSignup}
            className="w-full bg-green-500 p-2 rounded text-black font-semibold hover:bg-green-400 transition"
          >
            Signup
          </button>

          <p className="text-gray-400 text-sm text-center">
            Already have an account?{" "}
            <span
              className="text-green-400 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}