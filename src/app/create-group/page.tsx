"use client";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false); // Loading state add kiya

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !currentUser) {
      alert("Please enter group name and make sure you are logged in.");
      return;
    }
    
    setLoading(true);

    try {
        await addDoc(collection(db, "groups"), {
          name: groupName.trim(),
          admin: currentUser.uid,
          members: [currentUser.uid],
          createdAt: serverTimestamp(),
        });

        alert("Group created successfully!");
        setGroupName("");
    } catch (error) {
        console.error("Error creating group:", error);
        alert("Failed to create group.");
    } finally {
        setLoading(false);
    }
  };

  return (
    // 📱 Responsiveness: Form container centered (mx-auto), max-width set, responsive padding (p-4/sm:p-8)
    // 🎨 Theme Change: Dark background, dark border, shadow
    <div className="max-w-md mx-auto p-4 sm:p-8 mt-10 bg-gray-900 rounded-xl shadow-2xl border border-gray-700">
      
      {/* 🎨 Theme Change: Purple Heading */}
      <h1 className="text-3xl font-extrabold text-center mb-6 text-purple-400">
        Create New Group
      </h1>
      
      <div className="flex flex-col gap-4">
        <input
          // 📱 Responsiveness: Full width on all screens (w-full)
          // 🎨 Theme Change: Dark input background, purple focus ring
          className="w-full border border-gray-700 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button
          onClick={handleCreateGroup}
          disabled={loading}
          // 🎨 Theme Change: Purple button
          // 📱 Responsiveness: Full width on mobile (w-full)
          className={`w-full text-white px-4 py-3 rounded-lg font-semibold transition ${
            loading ? "bg-gray-600 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Creating..." : "Create Group"}
        </button>
        
        {!currentUser && (
            <p className="text-sm text-red-400 text-center mt-2">
                Please log in to create a group.
            </p>
        )}
      </div>
    </div>
  );
}
