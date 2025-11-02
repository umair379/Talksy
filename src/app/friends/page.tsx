"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
} from "firebase/firestore";

export default function FriendsPage() {
  interface User {
    uid: string;
    name?: string;
    email: string;
    friends?: string[];
    sentRequests?: string[];
    about?: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ✅ Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setCurrentUser({
          uid: u.uid,
          email: u.email ?? "",
          name: u.displayName ?? "",
        });
      } else setCurrentUser(null);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnap = await getDocs(collection(db, "users"));
      const data: User[] = querySnap.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<User, "uid">),
      }));
      setUsers(data);
    };
    fetchUsers();
  }, []);

  // ✅ Send friend request
  const sendRequest = async (targetUid: string) => {
    if (!currentUser) return alert("Please login first!");
    if (targetUid === currentUser.uid) return;

    const targetUser = users.find((u) => u.uid === targetUid);

    const hasSentRequest = currentUser.sentRequests?.includes(targetUid) ?? false;
    const hasReceivedRequest = targetUser?.sentRequests?.includes(currentUser.uid) ?? false;

    if (hasSentRequest)
      return alert("You have already sent a friend request to this user!");
    if (hasReceivedRequest)
      return alert("This user has already sent you a friend request. Please check your notifications!");

    // Add friend request in Firestore
    await addDoc(collection(db, "friendRequests"), {
      from: currentUser.uid,
      to: targetUid,
      status: "pending",
    });

    // Update sender’s sentRequests
    const currentUserRef = doc(db, "users", currentUser.uid);
    await updateDoc(currentUserRef, {
      sentRequests: arrayUnion(targetUid),
    });

    alert("Friend request sent!");

    // Update local state for immediate UI
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === currentUser.uid
          ? { ...u, sentRequests: [...(u.sentRequests ?? []), targetUid] }
          : u
      )
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-400 border-b border-gray-700 pb-2">
        People you may know
      </h1>
      <div className="grid gap-3">
        {users
          .filter((u) => u.uid !== currentUser?.uid)
          .map((u) => {
            const hasSentRequest = currentUser?.sentRequests?.includes(u.uid) ?? false;
            const hasReceivedRequest = u.sentRequests?.includes(currentUser?.uid ?? "") ?? false;

            return (
              <div
                key={u.uid}
                className="p-4 border border-gray-700 rounded-lg flex justify-between items-center bg-gray-800 text-gray-100 shadow-xl transition hover:bg-purple-900/50"
              >
                <div>
                  <h2 className="font-semibold text-lg text-purple-300">
                    {u.name || "No Name"}
                  </h2>
                  <p className="text-sm text-gray-400">{u.email}</p>
                  {u.about && (
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {u.about}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => sendRequest(u.uid)}
                  disabled={hasSentRequest || hasReceivedRequest}
                  className={`px-3 py-1 rounded transition text-sm font-medium ${
                    hasSentRequest || hasReceivedRequest
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {hasSentRequest
                    ? "Request Sent"
                    : hasReceivedRequest
                    ? "Respond"
                    : "Add Friend"}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
