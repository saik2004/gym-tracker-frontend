import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import AddWorkout from "./pages/AddWorkout";
import Logs from "./pages/Logs";
import ChatAssistant from "./pages/ChatAssistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // 🔥 Listen for login/logout changes
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <BrowserRouter>
      {/* ✅ Toast */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />

      {token && <Navbar />}

      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddWorkout />} />
            <Route path="/logs" element={<Logs />} />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>

      {token && <ChatAssistant />}
    </BrowserRouter>
  );
}