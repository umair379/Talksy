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
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 sm:px-0">
      <div className="w-full max-w-sm p-6 bg-gray-800 text-gray-100 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-purple-400 text-center border-b border-gray-700 pb-2">
          Login
        </h2>

        <input
          type="text"
          placeholder="Email or Username"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border border-gray-600 p-3 mb-4 w-full rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-600 p-3 mb-4 w-full rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-400"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 mb-4 rounded font-medium transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={() => router.push("/signup")}
          className="w-full text-center text-blue-500 hover:text-blue-400 underline"
        >
          Don’t have an account? Sign up
        </button>
      </div>
    </div>
  );
}