"use client";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) router.replace("/chat");
    });
    return () => unsub();
  }, [router]);

  const handleSignup = async () => {
    if (!username || !email || !password) return alert("Please fill all fields");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update displayName
      await updateProfile(user, { displayName: username });

      // Add user to Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        username,
        email,
        friends: [],
        sentRequests: [],
        about: "",
      });

      alert("Account created successfully!");
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
          Sign Up
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-600 p-3 mb-4 w-full rounded bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:border-purple-400"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-3 mb-4 rounded font-medium transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed text-gray-400"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <button
          onClick={() => router.push("/login")}
          className="w-full text-center text-blue-500 hover:text-blue-400 underline"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}