"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import useAuthRedirect from "@/hooks/useAuthRedirect";

export default function SignupPage() {
  useAuthRedirect("/"); // agar already logged in hai to home

  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const validatePassword = (pw: string) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{10,}$/;
    return regex.test(pw);
  };

  const sendOtp = async () => {
    if (!email) return alert("Enter email first");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.otp) {
        setSentOtp(data.otp);
        setOtpSent(true);
        alert("OTP sent to your email!");
      } else {
        alert("Failed to send OTP");
      }
    } catch {
      alert("Failed to send OTP");
    }
  };

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !username || !password)
      return alert("Please fill all fields");
    if (password !== rePassword) return alert("Passwords do not match");
    if (!validatePassword(password))
      return alert(
        "Password must be min 10 chars, start with capital, contain 1 number & 1 special char!"
      );
    if (!otpSent) return alert("Please send OTP first");
    if (otp !== sentOtp) return alert("Invalid OTP");

    // check if username already exists
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);
    if (!snap.empty) return alert("Username already taken!");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, {
        displayName: `${firstName} ${lastName}`,
      });

      // save additional info to Firestore
      await addDoc(collection(db, "users"), {
        uid: userCred.user.uid,
        firstName,
        lastName,
        username,
        email,
      });

      alert("Account created successfully!");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Something went wrong!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 sm:p-6 bg-gray-900 text-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-purple-400 border-b border-gray-700 pb-2">
        Sign Up
      </h2>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />

        <button
          onClick={sendOtp}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {otpSent ? "Resend OTP" : "Send OTP"}
        </button>

        {otpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <input
          type="password"
          placeholder="Re-enter Password"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
          className="border border-gray-700 p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />

        <button
          onClick={handleSignup}
          className="bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Sign Up
        </button>

        <button
          onClick={() => router.push("/login")}
          className="text-purple-400 underline text-center mt-2"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}