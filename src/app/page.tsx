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
      {/* 🎨 Theme Change: Darker background, light text, purple highlights */}
      {/* 📱 Responsiveness: Centered content, h-[80vh] for height */}
      <div className="flex flex-col items-center justify-center h-[80vh] bg-gray-900 rounded-xl shadow-lg text-center p-4 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-purple-400">
          Welcome to Talksy 💬
        </h1>
        <p className="text-gray-300 mb-6 text-base sm:text-lg">
          Connect with people and share your thoughts effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {user ? (
            <>
              <Link
                href="/chat"
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition w-full sm:w-auto text-sm sm:text-base"
              >
                Go to Chat
              </Link>
              <Link
                href="/create-group"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition w-full sm:w-auto text-sm sm:text-base"
              >
                Create Group
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition w-full sm:w-auto text-sm sm:text-base"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition w-full sm:w-auto text-sm sm:text-base"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
