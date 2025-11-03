"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
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

  const navLinks = [
    { name: "Chat", href: "/chat" },
    { name: "Groups", href: "/groups" },
    { name: "Create Group", href: "/create-group" },
    { name: "Search", href: "/search" },
    { name: "Friends", href: "/friends" },
    { name: "Profile", href: "/profile" },
    { name: "Requests", href: "/requests" },
    { name: "Users", href: "/users" },
  ];

  return (
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center">
      {/* Logo */}
      <Link
        href="/"
        className="font-extrabold text-xl text-purple-400 select-none mb-2 sm:mb-0"
      >
        Talksy
      </Link>

      {/* Links (visible always if user is logged in) */}
      <div className="flex flex-wrap justify-center gap-2">
        {user &&
          navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive(link.href)
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              {link.name}
            </Link>
          ))}
      </div>

      {/* Auth buttons */}
      <div className="flex gap-2 mt-2 sm:mt-0">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg transition text-sm"
          >
            Signout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/login")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className={`px-3 py-1 rounded-lg transition text-sm ${
                isActive("/signup")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
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