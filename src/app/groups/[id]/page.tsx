"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp?: Message;
}

export default function GroupChatPage() {
  const { id } = useParams();
  const groupId = Array.isArray(id) ? id[0] : id; // ✅ Ensure string type for Firestore
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!groupId) return;

    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!user) return alert("You must be logged in to send messages!");
    if (!groupId) return;

    await addDoc(collection(db, "groups", groupId, "messages"), {
      text: text.trim(),
      sender: user.email,
      timestamp: serverTimestamp(),
    });

    setText("");
  };

  // 🎨 Theme Change: Loading text color to purple
  if (loading) return <p className="text-center mt-10 text-purple-400">Loading chat...</p>;

  return (
    // 📱 Responsiveness: Defined height to fit screen, centered container, dark background
    <div className="flex flex-col h-[calc(100vh-70px)] max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
      
      {/* 🎨 Theme Change: Dark header, purple title */}
      <div className="bg-gray-800 text-white py-3 px-4 flex justify-between items-center shadow-lg border-b border-gray-700 rounded-t-xl">
        <h1 className="text-lg font-bold text-purple-400">Group Chat 💬</h1>
        <a 
            href={`/groups/${groupId}/manage`} 
            className="text-sm text-purple-400 hover:text-purple-300 underline"
        >
            Manage Group
        </a>
      </div>

      {/* 🎨 Theme Change: Dark chat area background */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${msg.sender === user?.email ? "justify-end" : "justify-start"}`}
          >
            <div
              // 📱 Responsiveness: max-w-[80%] for better mobile fit
              className={`px-4 py-2 rounded-2xl shadow text-sm max-w-[80%] sm:max-w-[70%] ${
                msg.sender === user?.email 
                  ? "bg-purple-600 text-white" // Sender: Purple
                  : "bg-gray-700 text-gray-100" // Receiver: Dark Gray
              }`}
            >
              <p>{msg.text}</p>
              {/* 🎨 Theme Change: Lighter opacity for sender tag on dark background */}
              <span className="text-[10px] text-gray-400 block mt-1">~ {msg.sender}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 🎨 Theme Change: Dark input bar, dark border top */}
      <div className="flex p-3 bg-gray-900 border-t border-gray-700">
        <input
          type="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => setText(e.target.value)}
          // 🎨 Theme Change: Dark input style, purple focus ring
          className="flex-1 border border-gray-700 rounded-full px-4 py-2 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button 
            onClick={handleSend} 
            // 🎨 Theme Change: Purple send button
            className="ml-2 bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
