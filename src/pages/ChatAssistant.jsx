import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import { useWorkoutStore } from "../store/useWorkoutStore";
import ChatSidebar from "../components/ChatSidebar";

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const { workouts } = useWorkoutStore();
  const bottomRef = useRef(null);

  // LOAD CHATS
  const loadChats = async (id) => {
    try {
      const res = await API.get(`/chats/${id}`);
      const formatted = res.data.flatMap((c) => [
        { role: "user", text: c.question },
        { role: "assistant", text: c.answer },
      ]);
      setMessages(formatted);
    } catch (err) {
      console.error(err);
    }
  };

 const handleSelectConversation = (id) => {
  // 🔥 if deleted or null → just clear
  if (!id) {
    setConversationId(null);
    setMessages([]);
    return;
  }

  setConversationId(id);
  loadChats(id);
  setShowSidebar(false);
};

  // CREATE NEW CHAT
  useEffect(() => {
  if (!open) return;

  const loadLastConversation = async () => {
    try {
      const res = await API.get("/conversations");

      if (res.data.length > 0) {
        const latest = res.data[0]; // latest chat
        setConversationId(latest._id);
        loadChats(latest._id);
      } else {
        // first time user → create chat
        const newChat = await API.post("/conversations");
        setConversationId(newChat.data._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  loadLastConversation();
}, [open]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const cleanText = (text = "") =>
    text.replace(/[*#`]/g, "").replace(/-\s+/g, "").trim();

  const typeMessage = (text = "") => {
  let i = 0;

  setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

  const interval = setInterval(() => {
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].text = text.slice(0, i + 1);
      return updated;
    });

    i++;

    if (i >= text.length) clearInterval(interval);
  }, 15); // 🔥 speed control (lower = faster)
};
  const askAI = async () => {
  if (!input.trim() || !conversationId) return;

  // 🔥 check if first message
  const isFirstMessage = messages.length === 0;

  // add user message to UI
  setMessages((prev) => [...prev, { role: "user", text: input }]);
  setInput("");

  try {
    setLoading(true);

    // send to backend
    const res = await API.post("/ai/chat", {
      question: input,
      conversationId,
      workouts,
      history: messages,
    });

    // show AI reply
    typeMessage(res.data.answer);

    // 🔥 AUTO TITLE LOGIC (IMPORTANT PART)
    if (isFirstMessage) {
      const shortTitle = input.split(" ").slice(0, 5).join(" ");

      await API.put(`/conversations/${conversationId}`, {
        title: shortTitle,
      });
    }

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {/* FLOAT BUTTON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-full shadow-lg text-lg z-50 hover:scale-105 transition"
        >
          Ask!
        </button>
      )}

      {/* MAIN CHAT */}
      {open && (
        <div className="fixed inset-0 z-50 flex bg-gradient-to-br from-[#0b141a] via-[#0f2027] to-[#0b141a] text-white">

          {/* DESKTOP SIDEBAR */}
          <div className="hidden md:block">
            <ChatSidebar
              onSelect={handleSelectConversation}
              selectedId={conversationId}
            />
          </div>

          {/* MOBILE SIDEBAR */}
          {showSidebar && (
  <div
    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
    onClick={() => setShowSidebar(false)}
  >
    <div
      className="w-64 h-full bg-[#111b21] animate-slideIn shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <ChatSidebar
        onSelect={handleSelectConversation}
        selectedId={conversationId}
        onClose={() => setShowSidebar(false)}
      />
    </div>
  </div>
)}

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]/80 backdrop-blur-lg border-b border-white/10">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden text-xl hover:scale-110 transition"
                  onClick={() => setShowSidebar(true)}
                >
                  ☰
                </button>

                <div>
                  <h2 className="font-semibold text-sm tracking-wide">
                    Fitness AI Coach
                  </h2>
                  <p className="text-xs text-green-400">● online</p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-red-400 text-lg hover:scale-110 transition"
              >
                ✕
              </button>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">

              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10 text-sm">
                  Start your fitness conversation 💪
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                      max-w-[85%] md:max-w-[65%]
                      rounded-2xl shadow-lg backdrop-blur-md
                      transition-all duration-200
                      ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-sm"
                          : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm"
                      }
                    `}
                  >
                    {cleanText(msg.text)}
                  </div>
                </div>
              ))}

              {loading && (
  <div className="flex gap-1 text-gray-400 text-sm">
    <span className="animate-bounce">•</span>
    <span className="animate-bounce delay-100">•</span>
    <span className="animate-bounce delay-200">•</span>
  </div>
)}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="p-3 bg-[#202c33]/80 backdrop-blur-lg border-t border-white/10">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 shadow-inner">

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your workout..."
                  className="flex-1 bg-transparent text-sm outline-none text-white placeholder-gray-400"
                  onKeyDown={(e) => e.key === "Enter" && askAI()}
                />

                <button
                  onClick={askAI}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-1 rounded-full text-sm hover:scale-105 transition"
                >
                  ➤
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}