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
    if (!searchTerm.trim()) return;
    setLoading(true);

    const usersRef = collection(db, "users");

    // 1️⃣ Search by name
    const qName = query(
      usersRef,
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8ff")
    );

    // 2️⃣ Search by username
    const qUsername = query(
      usersRef,
      where("username", ">=", searchTerm),
      where("username", "<=", searchTerm + "\uf8ff")
    );

    // Run both queries
    const [snapName, snapUsername] = await Promise.all([getDocs(qName), getDocs(qUsername)]);

    // Merge results and remove duplicates
    const merged: Record<string, User> = {};
    [...snapName.docs, ...snapUsername.docs].forEach((d) => {
      if (d.id !== me?.uid) {
        merged[d.id] = { uid: d.id, ...(d.data() as Omit<User, "uid">) };
      }
    });

    setResults(Object.values(merged));
    setLoading(false);
  };

  const sendRequest = async (toId: string) => {
    if (!me) return alert("Please login first");
    await addDoc(collection(db, "friendRequests"), {
      from: me.uid,
      to: toId,
      status: "pending",
      createdAt: new Date(),
    });
    alert("Friend request sent!");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Search Users</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {results.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul className="space-y-3">
          {results.map((u) => (
            <li
              key={u.uid}
              className="flex justify-between items-center bg-white p-3 rounded shadow-sm"
            >
              <div>
                <div className="font-medium">{u.name || u.username}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
              <button
                onClick={() => sendRequest(u.uid)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
