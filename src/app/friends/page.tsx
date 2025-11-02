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
    
    const targetUser = users.find(u => u.uid === id);

    // Agar request pehle hi bhej di gayi ho ya receive ho chuki ho toh rokna
    const hasSentRequest = currentUser?.sentRequests?.includes(id);
    const hasReceivedRequest = targetUser?.sentRequests?.includes(currentUser.uid);

    if (hasSentRequest) return alert("You have already sent a friend request to this user!");
    if (hasReceivedRequest) return alert("This user has already sent you a friend request. Please check your notifications!");


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
    // Local state update for immediate UI change
    setUsers(prev => prev.map(u => 
        u.uid === currentUser.uid ? { ...u, sentRequests: [...(u.sentRequests || []), id] } : u
    ));
  };

  return (
    // 📱 Responsiveness: Responsive padding (p-4 for mobile, sm:p-6 for larger screens)
    <div className="p-4 sm:p-6">
      {/* 🎨 Theme Change: Purple heading, larger font, dark border bottom */}
      <h1 className="text-2xl font-bold mb-4 text-purple-400 border-b border-gray-700 pb-2">
        People you may know
      </h1>
      <div className="grid gap-3">
        {users
          .filter((u) => u.uid !== currentUser?.uid)
          .map((u) => {
              // Check if a request has been sent to this user by current user
              const hasSentRequest = currentUser?.sentRequests?.includes(u.uid);
              // Check if a request has been received from this user (reverse check)
              const hasReceivedRequest = u.sentRequests?.includes(currentUser?.uid!); 

              return (
            <div
              key={u.uid}
              // 🎨 Theme Change: Dark background, light border, purple hover effect
              className="p-4 border border-gray-700 rounded-lg flex justify-between items-center bg-gray-800 text-gray-100 shadow-xl transition hover:bg-purple-900/50"
            >
              <div>
                {/* 🎨 Theme Change: Highlight name */}
                <h2 className="font-semibold text-lg text-purple-300">{u.name || "No Name"}</h2>
                <p className="text-sm text-gray-400">{u.email}</p>
                {u.about && (
                    // 📱 Responsiveness: About section hidden on small screens for cleaner view
                    <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                        {u.about}
                    </p>
                )}
              </div>
              <button
                onClick={() => sendRequest(u.uid)}
                disabled={hasSentRequest || hasReceivedRequest}
                // 🎨 Theme Change: Purple button, disable state for clarity
                className={`px-3 py-1 rounded transition text-sm font-medium ${
                    hasSentRequest || hasReceivedRequest
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed" // Disabled state
                    : "bg-purple-600 text-white hover:bg-purple-700" // Active state
                }`}
              >
                {/* Logic ke hisaab se button text badlega */}
                {hasSentRequest ? "Request Sent" : hasReceivedRequest ? "Respond" : "Add Friend"}
              </button>
            </div>
          )})}
      </div>
    </div>
  );
}
