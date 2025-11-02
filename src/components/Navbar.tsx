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
  const [menuOpen, setMenuOpen] = useState(false);

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
    <nav className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex justify-between items-center relative">
      {/* Logo / App name */}
      <div className="flex items-center space-x-2">
        <Link
          href="/"
          className="font-extrabold text-xl text-purple-400 select-none"
        >
          Talksy
        </Link>
      </div>

      {/* Desktop Links */}
      {user && (
        <div className="hidden md:flex space-x-2">
          {navLinks.map((link) => (
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
      )}

      {/* Auth buttons */}
      <div className="hidden sm:flex space-x-2">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg transition text-sm"
          >
            Logout
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

      {/* Mobile menu button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden bg-purple-600 px-3 py-1 rounded-lg text-sm"
      >
        {menuOpen ? "✖" : "☰"}
      </button>

      {/* Sliding Menu (Mobile) */}
      <div
        className={`fixed top-0 left-0 h-full w-2/3 bg-gray-800 text-white transform ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out p-6 md:hidden z-50`}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-purple-400">Talksy</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {user ? (
          <>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg mb-2 transition ${
                  isActive(link.href)
                    ? "bg-purple-600 text-white font-semibold"
                    : "hover:bg-purple-600/40"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition mt-4"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg mb-2 transition ${
                isActive("/login")
                  ? "bg-purple-600 text-white font-semibold"
                  : "hover:bg-purple-600/40"
              }`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg transition ${
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