"use client";
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [input, setInput] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) router.replace("/chat");
    });
    return () => unsub();
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      let email = input;
      // agar input email nahi hai, username consider karo
      if (!input.includes("@")) {
        const q = query(collection(db, "users"), where("username", "==", input));
        const snap = await getDocs(q);
        if (snap.empty) return alert("Username not found");
        email = snap.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/chat");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[85vh]">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <input
        type="text"
        placeholder="Email or Username"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-2 w-64 rounded"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className={`${
          loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
        } text-white px-4 py-2 rounded w-64 mb-3`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <button
        onClick={() => router.push("/signup")}
        className="text-blue-600 underline"
      >
        Don’t have an account? Sign up
      </button>
    </div>
  );
}
