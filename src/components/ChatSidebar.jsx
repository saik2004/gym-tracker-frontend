import { useEffect, useState } from "react";
import API from "../services/api";

export default function ChatSidebar({ onSelect, selectedId, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const loadConversations = async () => {
    try {
      const res = await API.get("/conversations");
     const sorted = res.data.sort((a, b) => b.isPinned - a.isPinned);
     setConversations(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // ➕ NEW CHAT
  const handleNew = async () => {
    try {
      const res = await API.post("/conversations");

      setConversations((prev) => [res.data, ...prev]); // instant UI update
      onSelect(res.data._id);
      onClose?.();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE CHAT (CLEAN + SAFE)
  const handleDelete = async (id) => {
    try {
      await API.delete(`/conversations/${id}`);

      // 🔥 remove instantly from UI
      setConversations((prev) => prev.filter((c) => c._id !== id));

      // 🔥 if active chat deleted → reset
      if (id === selectedId) {
        onSelect(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handlePin = async (id, current) => {
  try {
    console.log("PIN CLICK:", id, current);

    const res = await API.put(`/conversations/${id}`, {
      isPinned: !current,
    });

    console.log("UPDATED:", res.data);

    // 🔥 instant UI update
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c._id === id ? { ...c, isPinned: !current } : c
      );

      // 🔥 sort pinned first
      return updated.sort((a, b) => b.isPinned - a.isPinned);
    });

  } catch (err) {
    console.error("Pin failed:", err.response?.data || err.message);
  }
};

  return (
    <div className="h-full w-64 flex flex-col bg-[#111b21]/95 backdrop-blur-xl border-r border-white/10">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-semibold tracking-wide text-white">
          Chats
        </h2>

        <button
          onClick={onClose}
          className="text-red-400 text-lg hover:scale-110 transition md:hidden"
        >
          ✕
        </button>
      </div>

      {/* NEW CHAT */}
      <div className="p-3">
        <button
          onClick={handleNew}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg text-sm font-medium shadow hover:scale-[1.02] transition"
        >
          + New Chat
        </button>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-3">

        {conversations.length === 0 && (
          <p className="text-gray-400 text-xs text-center mt-6">
            No chats yet
          </p>
        )}

        {conversations.map((c) => {
  const isEditing = editingId === c._id;

  return (
    <div
      key={c._id}
      className={`
        group flex items-center justify-between px-3 py-2 rounded-xl
        transition-all duration-200
        ${
          selectedId === c._id
            ? "bg-white/10 border border-white/10"
            : "hover:bg-white/5"
        }
      `}
    >
      {/* 🔥 TITLE / INPUT */}
      {isEditing ? (
        <input
          autoFocus
          defaultValue={c.title}
          onBlur={async (e) => {
            const newTitle = e.target.value.trim();

            if (newTitle) {
              await API.put(`/conversations/${c._id}`, {
                title: newTitle,
              });
              loadConversations();
            }

            setEditingId(null);
          }}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.target.blur();
            }
          }}
          className="text-sm bg-transparent outline-none border-b border-gray-400 w-full"
        />
      ) : (
        <span
          onClick={() => {
            onSelect(c._id);
            onClose?.();
          }}
          className="text-sm truncate text-gray-200 cursor-pointer flex-1"
        >
          {c.title}
        </span>
      )}

      {/* ACTIONS */}
      <div className="flex items-center gap-2 ml-2">

        {/* ✏️ RENAME */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingId(c._id);
          }}
          className="text-gray-400 text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
        >
          ✏️
        </button>

        {/* ❌ DELETE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(c._id);
          }}
          className="text-red-400 text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
        >
          ✕
        </button>
<button
  onClick={(e) => {
    e.stopPropagation();
    handlePin(c._id, c.isPinned);
  }}
  className={`text-sm ${
    c.isPinned
      ? "opacity-100"
      : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
  }`}
>
  {c.isPinned ? "📌" : "📍"}
</button>

      </div>
    </div>
  );
})}
      </div>

      {/* FOOTER */}
      <div className="p-3 border-t border-white/10 text-xs text-gray-400 text-center">
        Gym AI v1.0
      </div>
    </div>
  );
}