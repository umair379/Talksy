"use client";
import { useEffect, useState } from "react";
import type { Timestamp } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  where,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { useParams } from "next/navigation";

export interface Message {
  id: string;
  text: string;
  sender: string;
  createdAt: Timestamp;
}

export default function ChatPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // ✅ Type-safe conversion

  const [input, setInput] = useState<string>("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // ✅ get current user
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // ✅ find or create chat between two users
  useEffect(() => {
    if (!currentUser || !id) return;

    const findChat = async () => {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("members", "array-contains", currentUser.uid)
      );
      const snap = await getDocs(q);

      const chatDoc = snap.docs.find((d) =>
        (d.data().members as string[]).includes(id)
      );

      if (chatDoc) {
        setChatId(chatDoc.id);
      } else {
        // create new chat
        const newChat = await addDoc(chatsRef, {
          members: [currentUser.uid, id],
          createdAt: serverTimestamp(),
        });
        setChatId(newChat.id);
      }
    };
    findChat();
  }, [currentUser, id]);

  // ✅ load messages realtime
  useEffect(() => {
    if (!chatId) return;
    const msgRef = collection(db, "chats", chatId, "messages");
    const q = query(msgRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]
      );
    });

    return () => unsub();
  }, [chatId]);

  // ✅ send message
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !chatId || !currentUser) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: input,
      sender: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  return (
    // 🎨 Theme Change: Dark background for chat area
    // 📱 Responsiveness: Full height to fill the screen space
    <div className="flex flex-col h-[calc(100vh-70px)] p-4 sm:p-6 bg-gray-900 rounded-xl shadow-inner">
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === currentUser?.uid
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              // 📱 Responsiveness: max-w-[80%] for mobile, max-w-lg for desktop
              // 🎨 Theme Change: Purple for sender, Dark Gray for receiver
              className={`px-4 py-2 rounded-2xl max-w-[80%] sm:max-w-lg text-wrap ${
                msg.sender === currentUser?.uid
                  ? "bg-purple-600 text-white" // Sender: Purple
                  : "bg-gray-700 text-gray-100" // Receiver: Dark Gray
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <form
        onSubmit={sendMessage}
        // 🎨 Theme Change: Dark border top for separation
        className="mt-4 flex items-center gap-2 border-t border-gray-700 pt-3"
      >
        <input
          type="text"
          placeholder="Type a message..."
          // 🎨 Theme Change: Dark input field, purple focus ring
          className="flex-1 border border-gray-700 rounded-lg px-4 py-2 outline-none bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          // 🎨 Theme Change: Purple send button
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
