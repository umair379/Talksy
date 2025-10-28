"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import Link from "next/link";

interface User {
  uid: string;
  name?: string;
  email?: string;
  about?: string;
}

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [me, setMe] = useState<FirebaseUser | null>(null);

  // current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setMe);
    return () => unsub();
  }, []);

  // fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const data: User[] = snap.docs.map((d) => {
        const userData = d.data() as Omit<User, "uid">; // ✅ uid exclude
        return { ...userData, uid: d.id }; // ✅ uid manually last me
      });
      setUsers(data);
    };
    fetchUsers();
  }, []);

  // send friend request
  const sendRequest = async (toUid: string) => {
    if (!me) return alert("Login first");

    // prevent duplicate
    const q = query(
      collection(db, "friendRequests"),
      where("from", "==", me.uid),
      where("to", "==", toUid),
      where("status", "==", "pending")
    );
    const existing = await getDocs(q);
    if (!existing.empty) return alert("Request already sent");

    await addDoc(collection(db, "friendRequests"), {
      from: me.uid,
      to: toUid,
      status: "pending",
      createdAt: new Date(),
    });

    alert("Request sent");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">All Users</h2>
      <ul className="space-y-3">
        {users.map((u) => (
          <li
            key={u.uid}
            className="flex justify-between items-center bg-white p-3 rounded shadow-sm"
          >
            <div>
              <div className="font-medium">{u.name || u.email}</div>
              <div className="text-sm text-gray-500">{u.about}</div>
            </div>
            <div className="space-x-2">
              <Link href={`/users/${u.uid}`} className="text-blue-600 underline">
                View
              </Link>
              {me?.uid !== u.uid && (
                <button
                  onClick={() => sendRequest(u.uid)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Request
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
