"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

export default function RequestsPage() {
  const [requests, setRequests] = useState<Record<string, string>>({});
  const [me, setMe] = useState<any>(null); // yahan apni logic lagao user fetch karne ki

  // Friend request status ko realtime track karna
  useEffect(() => {
    if (!me) return;

    const q = query(collection(db, "friendRequests"));
    const unsub = onSnapshot(q, (snap) => {
      const reqs: Record<string, string> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.from === me.uid) {
          reqs[data.to] = data.status; // Sent by me
        } else if (data.to === me.uid) {
          reqs[data.from] = data.status; // Received by me
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