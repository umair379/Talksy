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
    // 🎨 Theme Change: Black background for Navbar
    // 📱 Responsiveness: Use flex-wrap on small screens if necessary
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center">
      <div className="flex space-x-2 sm:space-x-4 items-center">
        {/* 🎨 Theme Change: Purple highlight for app name */}
        {user ? (
          <span className="font-extrabold text-xl text-purple-400 cursor-default select-none">
            Talksy
          </span>
        ) : (
          <Link
            href="/"
            className="font-extrabold text-xl text-purple-400 cursor-pointer select-none"
            style={{
              textDecoration: "none",
              pointerEvents: isActive("/") ? "none" : "auto",
            }}
          >
            Talksy
          </Link>
        )}

        {/* 📱 Responsiveness: Hide links on very small screens, display in a row on sm and up */}
        {user && (
          <div className="hidden sm:flex space-x-1 sm:space-x-2">
            <Link
              href="/chat"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/chat")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Chat
            </Link>

            <Link
              href="/groups"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/groups")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Groups
            </Link>

            <Link
              href="/create-group"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/create-group")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Create Group
            </Link>

            <Link
              href="/search"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/search")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Search
            </Link>
          </div>
        )}
      </div>

      {/* 隼 Right side buttons */}
      <div className="flex space-x-2 mt-2 sm:mt-0">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-1 rounded-lg transition text-sm"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/login")
                  ? "bg-purple-600 text-white font-semibold cursor-default"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/signup")
                  ? "bg-purple-600 text-white font-semibold cursor-default"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Signup
            </Link>
          </>
        )}
      </div>

      {/* 📱 Responsive Mobile Menu: Show links below App Name on small screens */}
      {user && (
        <div className="flex flex-wrap sm:hidden justify-center w-full space-x-2 mt-3">
          <Link
            href="/chat"
            className={`px-3 py-1 rounded-lg transition text-sm ${
              isActive("/chat")
                ? "bg-purple-600 text-white font-semibold"
                : "hover:bg-purple-600/40"
            }`}
          >
            Chat
          </Link>
          <Link
            href="/groups"
            className={`px-3 py-1 rounded-lg transition text-sm ${
              isActive("/groups")
                ? "bg-purple-600 text-white font-semibold"
                : "hover:bg-purple-600/40"
            }`}
          >
            Groups
          </Link>
          <Link
            href="/search"
            className={`px-3 py-1 rounded-lg transition text-sm ${
              isActive("/search")
                ? "bg-purple-600 text-white font-semibold"
                : "hover:bg-purple-600/40"
            }`}
          >
            Search
          </Link>
          {/* Added 'Create Group' on the second line for better spacing */}
          <Link
            href="/create-group"
            className={`px-3 py-1 rounded-lg transition text-sm mt-1 ${
              isActive("/create-group")
                ? "bg-purple-600 text-white font-semibold"
                : "hover:bg-purple-600/40"
            }`}
          >
            Create Group
          </Link>
        </div>
      )}
    </nav>
  );
}
