"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName || !currentUser) {
      alert("Please enter group name and make sure you are logged in.");
      return;
    }

    await addDoc(collection(db, "groups"), {
      name: groupName,
      admin: currentUser.uid,
      members: [currentUser.uid],
      createdAt: serverTimestamp(),
    });

    alert("Group created successfully!");
    setGroupName("");
  };

  return (
    <div className="flex flex-col items-center mt-20 gap-4">
      <h1 className="text-2xl font-bold">Create Group</h1>
      <input
        className="border px-4 py-2 rounded w-64"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button
        onClick={handleCreateGroup}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Group
      </button>
    </div>
  );
}
