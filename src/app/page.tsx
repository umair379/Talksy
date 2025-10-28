"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-[80vh] bg-gray-100 text-center">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">
          Welcome to Talksy 💬
        </h1>
        <p className="text-gray-700 mb-6">
          Connect with people and share your thoughts effortlessly.
        </p>

        {user ? (
          <div className="space-x-4">
            <Link
              href="/chat"
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Go to Chat
            </Link>
            <Link
              href="/create-group"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Group
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              href="/login"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Signup
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
