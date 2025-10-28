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
      <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-800">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">{children}</main>
    </div>
  );
}
