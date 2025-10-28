"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface FriendRequest {
  id: string;
  from: string;
  to: string;
  status: "pending" | "accepted" | "declined";
}

interface User {
  uid: string;
  name?: string;
  email?: string;
  about?: string;
  friends?: string[];
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [senders, setSenders] = useState<Record<string, User>>({});
  const [me, setMe] = useState<FirebaseUser | null>(null);

  // Track current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setMe);
    return () => unsub();
  }, []);

  // Fetch friend requests
  useEffect(() => {
    if (!me) return;

    const q = query(
      collection(db, "friendRequests"),
      where("to", "==", me.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const reqs: FriendRequest[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FriendRequest, "id">),
      }));

      setRequests(reqs);

      const senderData: Record<string, User> = {};
      for (const r of reqs) {
        const docSnap = await getDoc(doc(db, "users", r.from));
        const data = docSnap.data() as Omit<User, "uid"> | undefined;
        if (data) senderData[r.from] = { ...data, uid: r.from }; // ✅ uid ko last me assign
      }
      setSenders(senderData);
    });

    return () => unsub();
  }, [me]);

  const accept = async (req: FriendRequest) => {
    await updateDoc(doc(db, "friendRequests", req.id), { status: "accepted" });
    alert("Request accepted");
  };

  const decline = async (req: FriendRequest) => {
    await updateDoc(doc(db, "friendRequests", req.id), { status: "declined" });
    alert("Request declined");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
      {requests.length === 0 ? (
        <p>No requests</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="flex justify-between items-center bg-white p-3 rounded shadow-sm"
            >
              <div>
                <div className="font-medium">
                  {senders[r.from]?.name || r.from}
                </div>
                <div className="text-sm text-gray-500">
                  sent you a friend request
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => accept(r)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => decline(r)}
                  className="bg-gray-300 px-3 py-1 rounded"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
