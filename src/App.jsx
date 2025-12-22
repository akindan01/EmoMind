import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { sendMessageToGemini } from "./geminiServices";
import {
  Send,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  MessageSquareHeart,
  ExternalLink
} from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isLoading]);

  const startNewSession = () => {
    if (messages.length === 0 || window.confirm("Start a new session? This will clear the current conversation for your privacy.")) {
      setMessages([]);
      setInput("");
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      text: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const historyForApi = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const responseText = await sendMessageToGemini(historyForApi, userMessage.text);

      setMessages((prev) => [
        ...prev,
        { role: "model", text: responseText, timestamp: new Date() }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "_I'm having a brief connection issue. Please check your internet or try refreshing the session._",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-slate-200 font-sans selection:bg-blue-500/30">

      <nav className="flex justify-between items-center h-16 px-6 bg-[#161b22]/80 backdrop-blur-md border-b border-slate-800 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <MessageSquareHeart size={20} className="text-blue-500" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight leading-none">EmoMate</h1>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Clarity v1.0</span>
          </div>
        </div>

        <button
          onClick={startNewSession}
          className="group flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 px-4 py-2 rounded-xl transition-all border border-slate-700/50 text-sm font-medium"
        >
          <RefreshCw size={14} className={`transition-transform duration-500 group-hover:rotate-180 ${isLoading ? 'animate-spin' : ''}`} />
          New Session
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 min-h-full flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700">
              <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/20">
                <MessageSquareHeart size={48} className="text-blue-500" />
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Safe. Private. Supportive.</h2>
              <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed mb-10">
                I'm here to listen without judgment. How can I help you navigate your thoughts today?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {[
                  "Help me process a difficult day",
                  "I'm feeling a bit anxious",
                  "Suggest a quick grounding exercise",
                  "I just need someone to listen"
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => setInput(option)}
                    className="p-4 bg-[#161b22] border border-slate-800 rounded-2xl text-left text-sm font-medium hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-slate-300 group"
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">→</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-10">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in slide-in-from-bottom-4 fade-in duration-500`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${msg.role === "user" ? "bg-slate-800 border border-slate-700" : "bg-blue-600 border border-blue-500"
                  }`}>
                  {msg.role === "user" ? <User size={18} className="text-slate-400" /> : <MessageSquareHeart size={18} className="text-white" />}
                </div>

                <div className={`max-w-[85%] md:max-w-[80%] space-y-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block px-5 py-3.5 rounded-3xl shadow-sm ${msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-[#161b22] border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}>
                    <article className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-p:text-white' : 'prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-blue-400'}`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </article>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-500">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-[#161b22] border border-slate-800 px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-[#161b22] border-t border-slate-800 p-4 md:p-6 shrink-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
        <div className="max-w-3xl mx-auto space-y-4">

          <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 p-3 rounded-xl text-[11px] md:text-xs text-slate-400 leading-tight">
            <ShieldAlert size={16} className="text-red-500 shrink-0" />
            <p>
              I am an AI, not a healthcare professional. If you're in a crisis, please call
              or visit your nearest emergency room.
            </p>
          </div>

          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your thoughts here..."
              className="w-full bg-[#0d1117] text-white border border-slate-800 rounded-2xl pl-5 pr-14 py-4 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-base"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all flex items-center justify-center shadow-lg"
            >
              <Send size={18} />
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600 font-medium uppercase tracking-[0.2em]">
            EmoMate Clarity • A Space for Reflection
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
