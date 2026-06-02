import { useState, useEffect, useRef } from "react";
import { post } from "../../api";
import { Icon } from "../../components/layout";
import { Btn, Card } from "../../components/ui";

const INITIAL_MESSAGE = {
  role: "assistant",
  text: "Hello! I'm your Ayurvedic health assistant. Ask me about symptoms, herbs, treatments, diet, or Ayurvedic remedies. 🌿",
};

export default function ChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "user", text: msg }]);
    const res = await post("/chat", { message: msg });
    setLoading(false);
    setMessages((m) => [
      ...m,
      { role: "assistant", text: res.response || "I couldn't process that. Please try again." },
    ]);
  };

  return (
    <div className="max-w-2xl flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-800">AI Health Assistant</h2>
        <p className="text-gray-500 text-sm">Powered by AI — Ayurvedic medicine guidance only</p>
      </div>
      <Card cls="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  m.role === "user"
                    ? "bg-green-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {m.role === "assistant" && <span className="mr-1">🌿</span>}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl text-gray-500 text-sm">🌿 Thinking...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t p-3 flex gap-2">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about Ayurvedic remedies, symptoms, herbs..."
            disabled={loading}
          />
          <Btn onClick={send} disabled={loading || !input.trim()} cls="bg-green-600 text-white hover:bg-green-700 px-3">
            <Icon name="send" cls="w-4 h-4" />
          </Btn>
        </div>
      </Card>
    </div>
  );
}
