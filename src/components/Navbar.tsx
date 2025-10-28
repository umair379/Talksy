"use client";
import type { User as FirebaseUser } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
  return () => unsub();
}, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex space-x-4 items-center">
        {/* 🔹 App Name */}
        {user ? (
          <span className="font-extrabold text-xl cursor-default select-none">
            Talksy
          </span>
        ) : (
          <Link
            href="/"
            className="font-extrabold text-xl cursor-pointer select-none"
            style={{
              textDecoration: "none",
              color: "white",
              pointerEvents: isActive("/") ? "none" : "auto",
            }}
          >
            Talksy
          </Link>
        )}

        {/* 🔹 Links visible only after login */}
        {user && (
          <>
            <Link
              href="/chat"
              className={`px-3 py-1 rounded-lg transition ${
                isActive("/chat")
                  ? "bg-blue-500 text-white font-semibold"
                  : "hover:bg-blue-600/40"
              }`}
            >
              Chat
            </Link>

            <Link
              href="/groups"
              className={`px-3 py-1 rounded-lg transition ${
                isActive("/groups")
                  ? "bg-blue-500 text-white font-semibold"
                  : "hover:bg-blue-600/40"
              }`}
            >
              Groups
            </Link>

            <Link
              href="/create-group"
              className={`px-3 py-1 rounded-lg transition ${
                isActive("/create-group")
                  ? "bg-blue-500 text-white font-semibold"
                  : "hover:bg-blue-600/40"
              }`}
            >
              Create Group
            </Link>

            {/* 🔍 NEW: Search Users */}
            <Link
              href="/search"
              className={`px-3 py-1 rounded-lg transition ${
                isActive("/search")
                  ? "bg-blue-500 text-white font-semibold"
                  : "hover:bg-blue-600/40"
              }`}
            >
              Search
            </Link>
          </>
        )}
      </div>

      {/* 🔹 Right side buttons */}
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg transition"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className={`px-3 py-1 rounded-lg mr-3 transition ${
                isActive("/login")
                  ? "bg-blue-500 text-white font-semibold cursor-default"
                  : "hover:bg-blue-600/40"
              }`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={`px-3 py-1 rounded-lg transition ${
                isActive("/signup")
                  ? "bg-blue-500 text-white font-semibold cursor-default"
                  : "hover:bg-blue-600/40"
              }`}
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
