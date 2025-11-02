"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface User {
  uid: string;
  name?: string;
  username?: string;
  email?: string;
}

export default function SearchPage() {
  const [me, setMe] = useState<FirebaseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setMe);
    return () => unsub();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
        setResults([]);
        return;
    }
    setLoading(true);

    const usersRef = collection(db, "users");
    const term = searchTerm.toLowerCase().trim();

    // Firestore me case-insensitive search muskil hai, isliye hum sirf prefix match use kar rahe hain
    // Ya phir hum name/username ko bhi lower case mein store karein. 
    // Yahan hum assuming ki name/username lower-case mein stored hain ya hum sirf exact match dhoond rahe hain.

    // 1️⃣ Search by name (prefix match)
    const qName = query(
      usersRef,
      where("name", ">=", term),
      where("name", "<=", term + "\uf8ff") // \uf8ff is a high-end Unicode character
    );

    // 2️⃣ Search by username (prefix match)
    const qUsername = query(
      usersRef,
      where("username", ">=", term),
      where("username", "<=", term + "\uf8ff")
    );
    
    // 3️⃣ Search by email (exact match)
    const qEmail = query(
      usersRef,
      where("email", "==", term)
    );

    // Run all queries
    const [snapName, snapUsername, snapEmail] = await Promise.all([getDocs(qName), getDocs(qUsername), getDocs(qEmail)]);

    // Merge results and remove duplicates
    const mergedResults: Record<string, User> = {};
    
    [...snapName.docs, ...snapUsername.docs, ...snapEmail.docs].forEach((doc) => {
        const data = doc.data();
        if (doc.id !== me?.uid) { // Don't show current user
            mergedResults[doc.id] = {
                uid: doc.id,
                name: data.name,
                username: data.username,
                email: data.email,
            };
        }
    });

    setResults(Object.values(mergedResults));
    setLoading(false);
  };

  // ✅ Simplified friend request function (only sends to 'friendRequests' collection)
  const sendRequest = async (toId: string) => {
    if (!me) return alert("Please log in to send a request.");
    
    // Yahan hum simply request bhej rahe hain, duplicate check ko abhi ignore kiya gaya hai code chota rakhne ke liye.
    await addDoc(collection(db, "friendRequests"), {
      from: me.uid,
      to: toId,
      status: "pending",
      createdAt: new Date(),
    });
    alert("Friend request sent!");
  };

  return (
    // 📱 Responsive: Responsive padding, max-w-xl centered
    <div className="p-4 sm:p-6 max-w-xl mx-auto">
      {/* 🎨 Theme Change: Purple Heading */}
      <h2 className="text-2xl font-bold mb-4 text-purple-400 border-b border-gray-700 pb-2">
        Search Users
      </h2>

      {/* 📱 Responsive: Mobile par full width, desktop par gap-2 */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by name, username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // 🎨 Theme Change: Dark input style, purple focus ring
          className="border border-gray-700 p-3 rounded-lg w-full bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          // 🎨 Theme Change: Purple button
          className={`w-full sm:w-auto px-4 py-3 rounded-lg font-semibold transition ${
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="mt-4">
        {results.length === 0 && !loading && searchTerm.trim() ? (
          <p className="text-gray-400">No users found matching "{searchTerm}"</p>
        ) : (
          <ul className="space-y-3">
            {results.map((u) => (
              <li
                key={u.uid}
                // 🎨 Theme Change: Dark list item, light border, purple hover
                className="flex justify-between items-center border border-gray-700 p-3 rounded-lg bg-gray-800 text-gray-100 shadow-lg transition hover:bg-purple-900/50"
              >
                <div>
                  {/* 🎨 Theme Change: Highlight name/username */}
                  <div className="font-medium text-purple-300">{u.name || u.username || "No Name"}</div>
                  <div className="text-sm text-gray-400">{u.email}</div>
                </div>
                <button
                  onClick={() => sendRequest(u.uid)}
                  // 🎨 Theme Change: Purple button
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm flex-shrink-0"
                >
                  Send Request
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
