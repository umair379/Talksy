"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import { useRouter, usePathname } from "next/navigation";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      router.refresh(); // UI ko turant update karega
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ["/", "/login", "/signup"];

    if (!user && !publicRoutes.includes(pathname)) {
      router.replace("/login");
    }

    if (user && ["/login", "/signup", "/"].includes(pathname)) {
      router.replace("/chat");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      // 🎨 Theme Change: Darker loading screen
      <div className="flex items-center justify-center h-screen bg-gray-900 text-purple-400">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    // 🎨 Theme Change: Dark background, light text. Added `min-h-screen`
    <div className="bg-[#121212] text-gray-100 min-h-screen">
      <Navbar />
      {/* 📱 Responsiveness: Increased max-width for larger screens, maintained padding */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
