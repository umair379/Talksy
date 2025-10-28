"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function useAuthRedirect(redirectTo: string = "/") {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Agar login hai to redirect kar do
        router.push(redirectTo);
      }
    });

    return () => unsubscribe();
  }, [router, redirectTo]);
}
