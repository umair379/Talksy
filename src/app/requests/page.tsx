"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, DocumentData } from "firebase/firestore";
import { User } from "firebase/auth"; // User type agar Firebase Auth se use kar rahe ho

interface FriendRequests {
  [key: string]: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<FriendRequests>({});
  const [me, setMe] = useState<User | null>(null); // 'any' ki jagah Firebase User type

  useEffect(() => {
    if (!me) return;

    const q = query(collection(db, "friendRequests"));
    const unsub = onSnapshot(q, (snap) => {
      const reqs: FriendRequests = {};
      snap.docs.forEach((d: DocumentData) => {
        const data = d.data() as { from: string; to: string; status: string };
        if (data.from === me.uid) {
          reqs[data.to] = data.status;
        } else if (data.to === me.uid) {
          reqs[data.from] = data.status;
        }
      });
      setRequests(reqs);
    });

    return () => unsub();
  }, [me]);

  return (
    <div>
      <h1 className="text-xl font-bold">Friend Requests</h1>
      <pre>{JSON.stringify(requests, null, 2)}</pre>
    </div>
  );
}