"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // agar user login nahi hai to login page par bhej do
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);
}
