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

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading chat...</p>;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center shadow">
        <h1 className="text-lg font-bold">Group Chat 💬</h1>
        <a href={`/groups/${groupId}/manage`} className="underline text-sm">Manage Group</a>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${msg.sender === user?.email ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow text-sm max-w-[70%] ${
                msg.sender === user?.email ? "bg-blue-500 text-white" : "bg-white text-gray-800"
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-[10px] opacity-60 block mt-1">{msg.sender}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex p-3 bg-white border-t">
        <input
          type="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
        />
        <button onClick={handleSend} className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-full">
          Send
        </button>
      </div>
    </div>
  );
}
