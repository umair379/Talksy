"use client";
import type { User as FirebaseUser } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical } from "lucide-react"; // 📦 for three-dot icon

export default function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center relative">
      {/* Left Side */}
      <div className="flex space-x-2 sm:space-x-4 items-center">
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

        {/* Main Navbar Links */}
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
              href="/friends"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/friends")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Friends
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

            <Link
              href="/profile"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/profile")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Profile
            </Link>

            {/* Three Dots Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="px-2 py-1 rounded-lg hover:bg-purple-600/40 transition"
              >
                <MoreVertical size={18} />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-40 z-20">
                  <Link
                    href="/requests"
                    className={`block px-4 py-2 text-sm rounded-t-lg ${
                      isActive("/requests")
                        ? "bg-purple-600 text-white font-semibold"
                        : "hover:bg-purple-600/40"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Requests
                  </Link>

                  <Link
                    href="/users"
                    className={`block px-4 py-2 text-sm rounded-b-lg ${
                      isActive("/users")
                        ? "bg-purple-600 text-white font-semibold"
                        : "hover:bg-purple-600/40"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Users
                  </Link>

                  <Link
                    href="/create-group"
                    className={`block px-4 py-2 text-sm ${
                      isActive("/create-group")
                        ? "bg-purple-600 text-white font-semibold"
                        : "hover:bg-purple-600/40"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Create Group
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Side */}
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

      {/* Mobile Menu */}
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
            href="/friends"
            className={`px-3 py-1 rounded-lg transition text-sm ${
              isActive("/friends")
                ? "bg-purple-600 text-white font-semibold"
                : "hover:bg-purple-600/40"
            }`}
          >
            Friends
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
            href="/profile"
            className={`px-3 py-1 rounded-lg transition text-sm ${
              isActive("/profile")
                ? "bg-purple-600 text-white font-semibold"
                : "hover:bg-purple-600/40"
            }`}
          >
            Profile
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
        </div>
      )}
    </nav>
  );
}