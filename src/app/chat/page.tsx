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
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Select a User to Chat</h2>

      {users.length === 0 ? (
        <p className="text-gray-600">No users found 😕</p>
      ) : (
        <ul className="space-y-3">
          {users
            .filter((u) => u.uid !== currentUser?.uid)
            .map((user) => (
              <li
                key={user.uid}
                onClick={() => router.push(`/chat/${user.uid}`)}
                className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-blue-100"
              >
                {user.email}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
