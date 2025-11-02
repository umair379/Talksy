"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ChatUsers() {
  // Firebase se jo auth user aata hai
type FirebaseUser = {
  uid: string;
  email: string | null; // firebase user ka email null bhi ho sakta hai
};

// Firestore me stored user
interface AppUser {
  uid: string;
  email: string;
  name?: string;
  about?: string;
  friends?: string[];
}

  const [users, setUsers] = useState<AppUser[]>([]);
const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const router = useRouter();

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) setCurrentUser({ uid: user.uid, email: user.email }); // map Firebase user
    else router.push("/login");
  });
  return unsubscribe;
}, [router]);


  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
const data: AppUser[] = snapshot.docs.map((doc) => {
  const d = doc.data();
  return {
    uid: doc.id,
    email: d.email || "", // agar firebase me null hai tou fallback
    name: d.name,
    about: d.about,
    friends: d.friends || [],
  };
});
setUsers(data);

    };
    fetchUsers();
  }, []);

  return (
    // 📱 Responsiveness: Mobile par kam padding (p-4), laptop par zyada (sm:p-8)
    <div className="p-4 sm:p-8">
      {/* 🎨 Theme Change: Purple heading aur dark border */}
      <h2 className="text-2xl font-bold mb-6 text-purple-400 border-b border-gray-700 pb-2">
        Select a User to Chat
      </h2>

      {users.length === 0 ? (
        // 🎨 Theme Change: Dark background ke liye light grey text
        <p className="text-gray-400">No users found 😕</p>
      ) : (
        <ul className="space-y-3">
          {users
            .filter((u) => u.uid !== currentUser?.uid)
            .map((user) => (
              <li
                key={user.uid}
                onClick={() => router.push(`/chat/${user.uid}`)}
                // 🎨 Theme Change & 📱 Responsiveness: Dark background, light text, purple hover
                className="p-3 bg-gray-800 text-gray-100 rounded-lg cursor-pointer transition hover:bg-purple-900 border border-gray-700 shadow-md"
              >
                <div className="flex justify-between items-center">
                    {/* Display Name (if available) or Email, with purple highlight */}
                    <span className="font-medium text-lg text-purple-200">
                        {user.name || user.email}
                    </span>
                    {/* Email chota aur side mein dikhega */}
                    <span className="text-xs text-gray-400">
                        {user.name && user.email}
                    </span>
                </div>
                {user.about && (
                    // 📱 Responsiveness: About section mobile par chhupaya ja sakta hai ya chota font use hoga
                    <p className="text-sm text-gray-400 mt-1 hidden sm:block">
                        {/* Hidden on extra small screen, block on small and up (for better mobile list) */}
                        {user.about}
                    </p>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
