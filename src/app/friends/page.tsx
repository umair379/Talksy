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

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((u) => {
    if (u) setCurrentUser({ uid: u.uid, email: u.email!, name: u.displayName || "" });
    else setCurrentUser(null);
  });
  return () => unsubscribe();
}, []);

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

  const sendRequest = async (id: string) => {
    if (!currentUser) return alert("Please login first!");
    if (id === currentUser.uid) return;

    // ✅ Add to 'friendRequests' collection
    await addDoc(collection(db, "friendRequests"), {
      from: currentUser.uid,
      to: id,
      status: "pending",
    });

    // ✅ Update sender’s sentRequests
    const currentUserRef = doc(db, "users", currentUser.uid);
    await updateDoc(currentUserRef, {
      sentRequests: arrayUnion(id),
    });

    alert("Friend request sent!");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">People you may know</h1>
      <div className="grid gap-4">
        {users
          .filter((u) => u.uid !== currentUser?.uid)
          .map((u) => (
            <div
              key={u.uid}
              className="p-4 border rounded-lg flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <h2 className="font-semibold">{u.name}</h2>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <button
                onClick={() => sendRequest(u.uid)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Add Friend
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
